"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import RouteCard from "../../components/RouteCard"
import ReserveCard from "../../components/ReserveCard"
import FinalDispatchDialog from "../../components/FinalDispatchDialog"
import { usePlanByDay, useFinalDispatch } from "../../hooks/usePlanByDay"
import { formatDateLabel, formatDayOfWeek, parseDate } from "../../utils/dateUtils"

export default function DayPlanPage() {
  const params = useParams()
  const router = useRouter()
  const dayType = params.dayType as string
  const dateString = params.date as string

  // Memoize the date object to prevent recreation on each render
  const date = useMemo(() => parseDate(dateString), [dateString])

  // Получаем год и месяц для навигации назад
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // +1 потому что месяцы в JS начинаются с 0

  const { dayPlan, loading: loadingPlan } = usePlanByDay(date)
  const { finalDispatch, loading: loadingDispatch } = useFinalDispatch(date)

  const [showDispatchDialog, setShowDispatchDialog] = useState(false)

  const getDayTypeTitle = () => {
    switch (dayType) {
      case "workday":
        return "Рабочий день"
      case "saturday":
        return "Суббота"
      case "sunday":
        return "Воскресенье"
      case "holiday":
        return "Праздничный день"
      default:
        return "День"
    }
  }

  const formatDayTitle = () => {
    const weekday = formatDayOfWeek(date)
    const formattedDate = formatDateLabel(date)
    return `${weekday}, ${formattedDate}`
  }

  // Добавляем обработчик для перехода на страницу итоговой разнарядки
  const handleViewFinalDispatch = () => {
    router.push(`/dashboard/fleet-manager/release-plan/${dayType}/${dateString}/final-dispatch`)
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/fleet-manager/release-plan/daytype/${dayType}/${year}-${month}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">{getDayTypeTitle()}</h1>
          <p className="text-gray-500 mt-1">{formatDayTitle()}</p>
        </div>
      </div>

      {loadingPlan ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : !dayPlan ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500">Данные не найдены для выбранного дня</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {dayPlan.routes.map((route, index) => (
              <RouteCard
                key={route.id}
                id={route.id}
                number={route.number}
                order={route.order}
                name={route.name}
                date={dateString}
                dayType={dayType}
                delay={index * 0.05}
              />
            ))}

            {/* Добавляем карточку резерва в том же стиле */}
            <ReserveCard
              drivers={dayPlan.reserveDrivers}
              date={dateString}
              dayType={dayType}
              delay={dayPlan.routes.length * 0.05}
            />
          </div>

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

