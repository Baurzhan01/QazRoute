"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

import RouteCard from "../../../components/RouteCard"
import ReserveCard from "../../../components/ReserveCard"
import FinalDispatchDialog from "../../../components/FinalDispatchDialog"
import { usePlanByDay } from "../../../hooks/usePlanByDay"
import { useFinalDispatch } from "../../../hooks/useFinalDispatch"
import { formatDateLabel, formatDayOfWeek, parseDate } from "../../../utils/dateUtils"
import { getAuthData } from "@/lib/auth-utils"

type ValidDayType = "workday" | "saturday" | "sunday" | "holiday"

export default function DayPlanPage() {
  const params = useParams()
  const router = useRouter()

  const dateString = params.date as string
  const rawDayType = params.dayType as string
  const date = useMemo(() => parseDate(dateString), [dateString])
  const dayType = normalizeDayType(rawDayType)

  const authData = getAuthData()
  const convoyId = authData?.convoyId || ""
  const depotId = authData?.busDepotId || ""

  const { data: dayPlan, loading } = usePlanByDay(date, convoyId, depotId, dayType)
  const { finalDispatch } = useFinalDispatch(date)

  const [showDispatchDialog, setShowDispatchDialog] = useState(false)

  const handleViewFinalDispatch = () => {
    router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateString}/final-dispatch`)
  }

  const titleByDayType = {
    workday: "Рабочий день",
    saturday: "Суббота",
    sunday: "Воскресенье",
    holiday: "Праздничный день",
  }[dayType]

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/fleet-manager/release-plan/daytype/${dayType}/${date.getFullYear()}-${date.getMonth() + 1}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">{titleByDayType}</h1>
          <p className="text-gray-500 mt-1">{formatDayOfWeek(date)}, {formatDateLabel(date)}</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !dayPlan ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            Данные не найдены для выбранного дня
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {dayPlan.routes.map((route, index) => (
              <RouteCard
                key={route.routeId}
                id={route.routeId}
                number={route.routeNumber}
                order={index + 1}
                date={dateString}
                dayType={dayType}
                delay={index * 0.05}
              />
            ))}

            <ReserveCard
              drivers={dayPlan.reserves}
              date={dateString}
              dayType={dayType}
              delay={dayPlan.routes.length * 0.05}
            />
          </div>

          {/* Итоговая разнарядка */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 flex justify-end"
          >
            <Button className="gap-2" onClick={handleViewFinalDispatch}>
              <FileText className="h-4 w-4" />
              Показать итоговую разнарядку
            </Button>
          </motion.div>

          {finalDispatch && (
            <FinalDispatchDialog
              open={showDispatchDialog}
              onClose={() => setShowDispatchDialog(false)}
              dispatch={finalDispatch}
            />
          )}
        </>
      )}
    </div>
  )
}

function normalizeDayType(value: string): ValidDayType {
  const normalized = value.toLowerCase()
  if (["workday", "workdays"].includes(normalized)) return "workday"
  if (normalized === "saturday") return "saturday"
  if (normalized === "sunday") return "sunday"
  if (normalized === "holiday") return "holiday"
  return "workday"
}
