"use client"

import { useEffect, useState } from "react"
import { releasePlanService } from "@/service/releasePlanService"
import { routeService } from "@/service/routeService"
import type { Route, RouteStatus } from "@/types/route.types"

export function usePlanByDay(
  date: Date,
  convoyId: string,
  depotId: string,
  dayType: "workday" | "saturday" | "sunday" | "holiday"
) {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const dateStr = date.toISOString().split("T")[0]
      const routeStatus = getRouteStatusFromDayType(dayType)

      try {
        const res = await routeService.getByConvoyId(convoyId, routeStatus)
        const convoyRoutes = res.value ?? []

        if (convoyRoutes.length > 0) {
          await releasePlanService.createDispatchRoute(convoyId, dateStr)
        }

        setRoutes(convoyRoutes)
      } catch (err: any) {
        console.error("❌ Ошибка usePlanByDay:", err)
        setError(err.message || "Ошибка загрузки маршрутов")
      } finally {
        setLoading(false)
      }
    }

    if (convoyId && depotId) load()
  }, [date, convoyId, depotId, dayType])

  return { routes, loading, error }
}

function getRouteStatusFromDayType(dayType: string): RouteStatus {
  const map: Record<string, RouteStatus> = {
    workday: "Workday",
    saturday: "Saturday",
    sunday: "Sunday",
    holiday: "Holiday",
  }
  return map[dayType] ?? "Workday"
}
