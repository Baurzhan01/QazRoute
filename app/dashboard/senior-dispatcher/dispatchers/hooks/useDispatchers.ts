"use client"

import { useState, useEffect, useCallback } from "react"
import { convoyService } from "@/service/convoyService"
import { authService } from "@/service/authService"
import { coordinatorService } from "@/service/coordinatorService"
import { getAuthData } from "@/lib/auth-utils"
import type {
  Dispatcher,
  DispatcherFilters,
  DispatcherShift,
  DispatcherStatus,
  NewDispatcher,
  Convoy,
} from "../types/dispatcher.types"

export function useDispatchers() {
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([])
  const [convoys, setConvoys] = useState<Convoy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<DispatcherFilters>({ status: null, convoyId: null })

  const auth = getAuthData()
  const depotId = auth?.busDepotId || ""

  // Загрузка диспетчеров
  const loadDispatchers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await authService.getByDepotId(depotId)
      if (!res.isSuccess || !res.value) throw new Error("Ошибка получения пользователей")
  
      const filtered = res.value
        .filter((user: any) => user.role.toLowerCase() === "dispatcher")
        .map((user: any) => ({
          ...user,
          status: user.isBan ? "blocked" : "offline",
          convoy: user.convoy ?? { id: "", name: "—", number: "—" },
          shiftsCount: 0,
        }))
        .filter((user: any) =>
          (filters.convoyId ? user.convoy.id === filters.convoyId : true) &&
          (filters.status ? user.status === filters.status : true)
        )
  
      setDispatchers(filtered)
      setError(null)
    } catch (err) {
      setError("Ошибка при загрузке диспетчеров")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters, depotId])
  

  // Загрузка автоколонн с добавлением name
  const loadConvoys = useCallback(async () => {
    try {
      const res = await convoyService.getByDepotId(depotId)
      const withNames = res.value?.map(c => ({
        ...c,
        name: `Колонна №${c.number}`
      })) || []
      setConvoys(withNames)
    } catch (err) {
      console.error("Ошибка при загрузке колонн:", err)
    }
  }, [depotId])

  useEffect(() => {
    loadConvoys()
    loadDispatchers()
  }, [loadConvoys, loadDispatchers])

  const updateFilters = useCallback((newFilters: DispatcherFilters) => {
    setFilters(newFilters)
  }, [])

  const addDispatcher = useCallback(async (data: NewDispatcher) => {
    try {
      await authService.register({
        fullName: data.fullName,
        email: data.email ?? "",
        login: data.login,
        password: data.password,
        role: "dispatcher",
        busDepotId: depotId,
      })
      await loadDispatchers()
      return true
    } catch (err) {
      setError("Ошибка при добавлении диспетчера")
      console.error(err)
      return false
    }
  }, [loadDispatchers, depotId])

  const updateDispatcher = useCallback(async (id: string, data: NewDispatcher) => {
    try {
      await authService.updateUser(id, {
        fullName: data.fullName,
        role: "dispatcher",
      })
      await loadDispatchers()
      return true
    } catch (err) {
      setError("Ошибка при обновлении диспетчера")
      console.error(err)
      return false
    }
  }, [loadDispatchers])

  const removeDispatcher = useCallback(async (id: string) => {
    try {
      await authService.deleteUser(id)
      await loadDispatchers()
      return true
    } catch (err) {
      setError("Ошибка при удалении диспетчера")
      console.error(err)
      return false
    }
  }, [loadDispatchers])

  const changeStatus = useCallback(async (id: string, status: DispatcherStatus) => {
    try {
      await authService.banUser(id)
      await loadDispatchers()
      return true
    } catch (err) {
      setError("Ошибка при изменении статуса")
      console.error(err)
      return false
    }
  }, [loadDispatchers])

  const getDispatcherShifts = useCallback(async (dispatcherId: string): Promise<DispatcherShift[]> => {
    try {
      const now = new Date()
      const res = await coordinatorService.getUserShiftsByMonth(
        dispatcherId,
        depotId,
        now.getFullYear(),
        now.getMonth() + 1
      )

      const shifts: DispatcherShift[] = res.value?.map((day) => ({
        id: `${dispatcherId}-${day.date}`,
        dispatcherId,
        date: day.date,
        startTime: "06:00",
        endTime: "14:30",
        duration: 8,
        status: "completed" as const, // ✅ фикс
        shiftType: day.shiftType,
      })) ?? []
      
      return shifts
    } catch (err) {
      console.error("Ошибка при загрузке смен диспетчера:", err)
      return []
    }
  }, [depotId])

  return {
    dispatchers,
    convoys,
    loading,
    error,
    filters,
    updateFilters,
    addDispatcher,
    updateDispatcher,
    removeDispatcher,
    changeStatus,
    getDispatcherShifts,
  }
}
