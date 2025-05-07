"use client"

import { useQuery } from "@tanstack/react-query"
import { releasePlanService } from "@/service/releasePlanService"
import type { FinalDispatchData, RouteGroup, ReserveAssignment } from "@/types/releasePlanTypes"

export function useFinalDispatch(date: Date) {
  const dateStr = date.toISOString().split("T")[0]

  const {
    data: finalDispatch,
    isLoading,
    error,
  } = useQuery<FinalDispatchData>({
    queryKey: ["finalDispatch", dateStr],
    queryFn: async () => {
      const response = await releasePlanService.getFullDispatchByDate(dateStr)

      if (!response.isSuccess || !response.value) {
        throw new Error(response.error || "Ошибка при загрузке итоговой разнарядки")
      }

      const routeGroups: RouteGroup[] = response.value.routes.map((route: any) => ({
        routeId: route.routeId,
        routeNumber: route.routeNumber,
        assignments: route.assignedDrivers.map((driver: any, index: number) => ({
          garageNumber: driver.garageNumber ?? "-",
          stateNumber: driver.stateNumber ?? "-",
          departureTime: driver.shift1Time ?? "",
          scheduleTime: driver.scheduleTime ?? "",
          endTime: driver.endTime ?? "",
          additionalInfo: driver.additionalInfo ?? "",
          driver: {
            id: driver.driverId,
            personnelNumber: driver.personnelNumber ?? "",
            fullName: driver.driverName ?? "",
            status: "Active",
          },
          departureNumber: index + 1,
        }))
      }))

      const reserveAssignments: ReserveAssignment[] = response.value.reserves.map((r: any) => ({
        driverId: r.driverId,
        personnelNumber: r.personnelNumber ?? "",
        fullName: r.fullName ?? "",
      }))

      return {
        date: dateStr, // <== 🔥 добавлено поле date
        routeGroups,
        reserveAssignments,
      }
    },
    enabled: !!dateStr,
  })

  return { finalDispatch, loading: isLoading, error }
}
