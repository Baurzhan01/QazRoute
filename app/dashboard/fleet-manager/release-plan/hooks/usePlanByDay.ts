"use client"

import { useState, useEffect } from "react"
import { routeService } from "@/service/routeService"
import { busLineService } from "@/service/busLineService"
import { driverService } from "@/service/driverService"
import type { Driver } from "@/types/driver.types"
import type { ReserveDriver } from "@/types/releasePlanTypes"

interface PlanRoute {
  routeId: string
  routeNumber: string
  exits: {
    busLineId: string
    exitTime: string
    endTime: string
  }[]
}

interface UsePlanByDayResult {
  routes: PlanRoute[]
  reserves: ReserveDriver[]
}

export function usePlanByDay(
  date: Date,
  convoyId: string,
  depotId: string,
  dayType: string
) {
  const [data, setData] = useState<UsePlanByDayResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true)
      setError(null)

      try {
        const dateStr = date.toISOString().split("T")[0]

        // 1. Получаем маршруты
        const routesResponse = await routeService.getByConvoyId(convoyId, dayType)

        if (!routesResponse.isSuccess || !routesResponse.value) {
          throw new Error(routesResponse.error || "Ошибка загрузки маршрутов")
        }

        const routes = await Promise.all(
          routesResponse.value.map(async (route) => {
            const exitsResponse = await busLineService.getByRouteId(route.id!)
            const exits =
              exitsResponse.isSuccess && exitsResponse.value
                ? exitsResponse.value.map((exit) => ({
                    busLineId: exit.id!,
                    exitTime: exit.exitTime, // ✅ уже строка
                    endTime: exit.endTime,   // ✅ уже строка
                  }))
                : []

            return {
              routeId: route.id!,
              routeNumber: route.number,
              exits,
            }
          })
        )

        // 2. Получаем всех водителей по депо и фильтруем резервных
        const driversResponse = await driverService.getByDepotId(depotId)

        const reserves: ReserveDriver[] =
          driversResponse.isSuccess && Array.isArray(driversResponse.value)
            ? driversResponse.value
                .filter((d: Driver) => d.inReserve)
                .map((d: Driver) => {
                  const [lastName = "", firstName = "", middleName = ""] = d.fullName.split(" ")
                  return {
                    id: d.id!,
                    personnelNumber: d.serviceNumber,
                    firstName,
                    lastName,
                    middleName,
                  }
                })
            : []

        setData({ routes, reserves })
      } catch (err: any) {
        console.error("Ошибка загрузки плана дня:", err)
        setError(err.message || "Не удалось загрузить план дня")
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [date, convoyId, depotId, dayType])

  return { data, loading, error }
}
