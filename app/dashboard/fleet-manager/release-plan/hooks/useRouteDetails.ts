// app/dashboard/fleet-manager/release-plan/hooks/useRouteDetails.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import { releasePlanService } from "@/service/releasePlanService"
import type { RouteDetails } from "@/types/releasePlanTypes"

export function useRouteDetails(routeId: string, date: Date) {
  const dateStr = date.toISOString().split("T")[0]

  const {
    data: routeDetails,
    isLoading,
    error,
  } = useQuery<RouteDetails>({
    queryKey: ["routeDetails", routeId, dateStr],
    queryFn: async () => {
      const response = await releasePlanService.getDispatchRouteDetails(routeId, dateStr)
      if (!response.isSuccess || !response.value) {
        throw new Error(response.error || "Ошибка при загрузке деталей маршрута")
      }
      return response.value
    },
    enabled: !!routeId && !!dateStr,
  })

  return { routeDetails, loading: isLoading, error }
}
