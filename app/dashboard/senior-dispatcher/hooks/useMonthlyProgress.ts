import { useState, useEffect } from "react"
import { coordinatorService } from "@/service/coordinatorService"
import { getAuthData } from "@/lib/auth-utils"
import type { ConvoyCoordinatorCard } from "@/types/coordinator.types"

interface MonthlyProgressData {
  totalPlanned: number
  totalReleased: number
  averageCompletion: number
}

export function useMonthlyProgress() {
  const [data, setData] = useState<MonthlyProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgress = async () => {
      const auth = getAuthData()
      if (!auth?.busDepotId) {
        setError("Не удалось получить busDepotId из authData")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const today = new Date().toISOString().split("T")[0]
        const response = await coordinatorService.getConvoysByDepot(auth.busDepotId, today)
        const convoys: ConvoyCoordinatorCard[] = response.value ?? []

        const totalPlanned = convoys.reduce((sum, c) => sum + (c.planned ?? 0), 0)
        const totalReleased = convoys.reduce((sum, c) => sum + (c.released ?? 0), 0)
        const averageCompletion =
          convoys.length > 0
            ? Math.round(convoys.reduce((sum, c) => sum + (c.completion ?? 0), 0) / convoys.length)
            : 0

        setData({ totalPlanned, totalReleased, averageCompletion })
        setError(null)
      } catch (err) {
        setError("Ошибка при загрузке месячного прогресса")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  return { data, loading, error }
}
