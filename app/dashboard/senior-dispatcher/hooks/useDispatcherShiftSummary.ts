// hooks/useDispatcherShiftSummary.ts
import { useEffect, useState } from "react"
import { getAuthData } from "@/lib/auth-utils"
import { coordinatorService } from "@/service/coordinatorService"

interface DispatcherShiftSummary {
  onShift: number
  vacation: number
  dayOff: number
  shiftInfo?: {
    name: string
    start: string
    end: string
    dispatchers: string[]
  }
}

export function useDispatcherShiftSummary() {
  const [data, setData] = useState<DispatcherShiftSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuthData()
      if (!auth?.busDepotId) {
        setError("Не указан ID автобусного парка")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth() + 1 // JS: 0-11

        const res = await coordinatorService.getWorkShiftsByDepot(auth.busDepotId, year, month)

        if (!res.isSuccess || !res.value) {
          throw new Error(res.error || "Ошибка получения смен")
        }

        let onShift = 0
        let vacation = 0
        let dayOff = 0
        const dispatchers: string[] = []

        const todayISO = today.toISOString().split("T")[0]

        for (const user of res.value) {
          onShift += user.day + user.night
          vacation += user.vacation
          dayOff += user.dayOff

          const todayShift = user.days.find((d) => d.date === todayISO)
          if (todayShift?.shiftType === "Day" || todayShift?.shiftType === "Night") {
            dispatchers.push(user.fullName)
          }
        }

        setData({
          onShift,
          vacation,
          dayOff,
          shiftInfo: {
            name: "Дневная смена",
            start: "06:00",
            end: "14:30",
            dispatchers,
          },
        })
        setError(null)
      } catch (err) {
        console.error("Ошибка при загрузке смен:", err)
        setError("Не удалось получить данные по сменам")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
