import { useState, useCallback } from "react"
import { coordinatorService } from "@/service/coordinatorService"
import { getAuthData } from "@/lib/auth-utils"
import type { UserWorkShift, WorkShiftType } from "@/types/coordinator.types"

export function useShiftTable() {
  const [shifts, setShifts] = useState<UserWorkShift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const auth = getAuthData()
  const depotId = auth?.busDepotId || ""

  const fetchShifts = useCallback(async (year: number, month: number) => {
    setLoading(true)
    try {
      const res = await coordinatorService.getShiftTable(depotId, year, month)
      if (!res.isSuccess || !res.value) throw new Error("Ошибка загрузки табеля")
      setShifts(res.value)
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Не удалось загрузить табель")
    } finally {
      setLoading(false)
    }
  }, [depotId])

  const updateShift = useCallback(async (userId: string, date: string, shiftType: WorkShiftType) => {
    try {
      const res = await coordinatorService.updateShift(userId, date, shiftType)
      return res.isSuccess
    } catch (err) {
      console.error("Ошибка при обновлении смены", err)
      return false
    }
  }, [])

  return { shifts, loading, error, fetchShifts, updateShift }
}
