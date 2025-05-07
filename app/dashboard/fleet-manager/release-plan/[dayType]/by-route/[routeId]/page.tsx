// app/dashboard/fleet-manager/release-plan/[dayType]/by-route/[routeId]/page.tsx
"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { releasePlanService } from "@/service/releasePlanService"
import { formatDateLabel, parseDate } from "@/app/dashboard/fleet-manager/release-plan/utils/dateUtils"
import RouteDetailsTable from "@/app/dashboard/fleet-manager/release-plan/components/RouteDetailsTable"
import type { RouteDispatchDetails } from "@/types/schedule.types"
import type { ValidDayType } from "@/types/releasePlanTypes"
import Link from "next/link"

export default function RouteDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const dayTypeParam = params.dayType as string
  const routeId = params.routeId as string
  const dateString = params.date as string
  const date = useMemo(() => parseDate(dateString), [dateString])

  const dayType = normalizeDayType(dayTypeParam)
  const [routeDetails, setRouteDetails] = useState<RouteDispatchDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      try {
        const res = await releasePlanService.getRouteDetails(routeId, dateString)
        if (res.isSuccess && res.value) {
          setRouteDetails(res.value)
        } else {
          console.error("Ошибка загрузки деталей маршрута:", res.error)
        }
      } catch (err) {
        console.error("Ошибка загрузки маршрута:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [routeId, dateString])

  const getDayTitle = () => {
    return `${formatDateLabel(date)} — маршрут`
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/${dateString}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">
            Детали маршрута
          </h1>
          <p className="text-gray-500 mt-1">{getDayTitle()}</p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500 animate-pulse">
            Загрузка данных маршрута...
          </CardContent>
        </Card>
      ) : routeDetails ? (
        <RouteDetailsTable routeDetails={routeDetails} />
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-red-500">
            Не удалось загрузить детали маршрута
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function normalizeDayType(value: string): ValidDayType {
  switch (value.toLowerCase()) {
    case "workday":
    case "workdays":
      return "workday"
    case "saturday":
      return "saturday"
    case "sunday":
      return "sunday"
    case "holiday":
      return "holiday"
    default:
      return "workday"
  }
}
