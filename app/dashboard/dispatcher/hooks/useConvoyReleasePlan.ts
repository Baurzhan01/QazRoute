import { useEffect, useState } from "react"
import { releasePlanService } from "@/service/releasePlanService"
import type { FinalDispatchData } from "@/types/releasePlanTypes"

export function useConvoyReleasePlan(date: string, convoyId: string) {
  const [data, setData] = useState<FinalDispatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!date || !convoyId) return

    const load = async () => {
      setLoading(true)
      try {
        const res = await releasePlanService.getFullDispatchByDate(date, convoyId)
        if (res.isSuccess) {
          setData(res.value)
        } else {
          setError(res.error ?? "Ошибка загрузки данных")
        }
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить план выпуска")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [date, convoyId])

  return { data, loading, error }
}
