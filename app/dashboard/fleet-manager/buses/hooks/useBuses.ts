import { useEffect, useState, useCallback } from "react"
import { busService } from "@/service/busService"
import type { Bus, BusWithDrivers } from "@/types/bus.types"

export const useBuses = (selectedStatus: string | null) => {
  const convoyId: string | null = (() => {
    if (typeof window === "undefined") return null
    const authData = localStorage.getItem("authData")
    if (!authData) return null
    const parsed = JSON.parse(authData)
    return parsed?.convoyId ?? null
  })()

  const [buses, setBuses] = useState<BusWithDrivers[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  const fetchBuses = useCallback(async () => {
    if (!convoyId) return

    try {
      setLoading(true)
      const result = await busService.filter({
        convoyId,
        status: selectedStatus,
        search: searchQuery,
        page: currentPage,
        pageSize,
      })

      setBuses(result.items || [])
      setTotalPages(Math.ceil(result.totalCount / pageSize))
    } catch (err) {
      console.error("Ошибка при получении автобусов:", err)
    } finally {
      setLoading(false)
    }
  }, [convoyId, selectedStatus, searchQuery, currentPage, pageSize])

  useEffect(() => {
    fetchBuses()
  }, [fetchBuses])

  const handleAddBus = async (
    newBus: Omit<Bus, "id">,
    driverIds: string[] = []
  ): Promise<BusWithDrivers | null> => {
    try {
      const createdId = await busService.create({ ...newBus, driverIds: [] })
      if (!createdId) {
        console.error("❌ Автобус не создан или не имеет ID")
        return null
      }

      if (driverIds.length > 0) {
        await busService.assignDrivers(createdId, driverIds)
      }

      await fetchBuses() // 🔁 обновим список с сервера
      return await busService.getWithDrivers(createdId)
    } catch (err) {
      console.error("🚨 Ошибка при добавлении автобуса:", err)
      return null
    }
  }

  const handleUpdateBus = async (updated: Bus) => {
    await busService.update(updated.id, updated)
    await fetchBuses()
  }

  const handleDeleteBus = async (id: string) => {
    await busService.delete(id)
    await fetchBuses()
  }

  const assignDriverToBus = async (driverId: string, busId: string) => {
    await busService.assignDrivers(busId, [driverId])
    await fetchBuses()
  }

  const removeDriverFromBus = async (driverId: string, busId: string) => {
    await busService.removeDriver(busId, driverId)
    await fetchBuses()
  }

  const getBusWithDrivers = (id: string): BusWithDrivers | undefined =>
    buses.find((bus) => bus.id === id)

  const refetchBuses = useCallback(() => {
    fetchBuses()
  }, [fetchBuses])

  return {
    buses,
    totalPages,
    currentPage,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    handleAddBus,
    handleUpdateBus,
    handleDeleteBus,
    assignDriverToBus,
    removeDriverFromBus,
    getBusWithDrivers,
    loading,
    refetchBuses
  }
}
