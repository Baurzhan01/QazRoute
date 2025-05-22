"use client"

import { useEffect, useState } from "react"
import { releasePlanService } from "@/service/releasePlanService"
import type { ReserveDriver } from "@/types/releasePlanTypes"
import type { ReserveAssignment } from "@/types/releasePlanTypes"

export function useReserveAssignments(date: Date) {
  const [data, setData] = useState<ReserveDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const dateStr = date.toISOString().split("T")[0]

      try {
        const res = await releasePlanService.getReserveAssignmentsByDate(dateStr)

        if (!res.isSuccess || !res.value) {
          throw new Error(res.error || "Ошибка загрузки резервов")
        }

        const drivers: ReserveDriver[] = res.value.map((r: ReserveAssignment, i: number) => {
          const [lastName = "—", firstName = "—", middleName = ""] =
            r.driver?.fullName?.split(" ") ?? []

          return {
            id: `reserve-${i}`,
            personnelNumber: r.driver?.serviceNumber ?? "—",
            firstName,
            lastName,
            middleName,
          }
        })

        setData(drivers)
      } catch (err: any) {
        console.error("❌ Ошибка загрузки резервов:", err)
        setError(err.message || "Ошибка получения резервов")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [date])

  return { drivers: data, loading, error }
}
