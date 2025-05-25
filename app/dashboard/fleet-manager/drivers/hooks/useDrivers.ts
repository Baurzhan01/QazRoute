// hooks/useDrivers.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { driverService } from "@/service/driverService"
import { registrationRequestService } from "@/service/registrationRequestService"
import type { Driver, DriverStatus, DriverStatusCount } from "@/types/driver.types"

function calculateDriverTotal(counts: Partial<Omit<DriverStatusCount, "total">> = {}): DriverStatusCount {
  const total =
    (counts.OnWork || 0) +
    (counts.DayOff || 0) +
    (counts.OnVacation || 0) +
    (counts.OnSickLeave || 0) +
    (counts.Intern || 0) +
    (counts.Fired || 0)

  return {
    OnWork: counts.OnWork || 0,
    DayOff: counts.DayOff || 0,
    OnVacation: counts.OnVacation || 0,
    OnSickLeave: counts.OnSickLeave || 0,
    Intern: counts.Intern || 0,
    Fired: counts.Fired || 0,
    total,
  }
}

export function useDrivers() {
  const queryClient = useQueryClient()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [convoyId, setConvoyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize] = useState(10)
  const [inReserve, setInReserve] = useState(false)
  const [busInfo, setBusInfo] = useState<Record<string, any>>({})
  const [selectedStatus, setSelectedStatus] = useState<DriverStatus | null>(null)
  const [statusCounts, setStatusCounts] = useState<DriverStatusCount>({
    OnWork: 0,
    DayOff: 0,
    OnVacation: 0,
    OnSickLeave: 0,
    Intern: 0,
    Fired: 0,
    total: 0,
  })

  useEffect(() => {
    const authData = localStorage.getItem("authData")
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        setConvoyId(parsed?.convoyId ?? null)
      } catch (error) {
        console.warn("Ошибка чтения convoyId из localStorage", error)
      }
    }
  }, [])

  useEffect(() => {
    if (!convoyId || inReserve) return
    const fetchStatusStats = async () => {
      try {
        const response = await driverService.getStatusStats(convoyId)
        if (response.isSuccess && response.value) {
          setStatusCounts(calculateDriverTotal(response.value))
        }
      } catch (err) {
        console.error("Ошибка при загрузке статистики по статусам", err)
      }
    }
    fetchStatusStats()
  }, [convoyId, inReserve])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedStatus, inReserve])

  const fetchDrivers = useCallback(async () => {
    if (!convoyId) return
    setLoading(true)
    setError(null)

    try {
      if (inReserve) {
        const response = await registrationRequestService.getReserve()
        if (response.isSuccess && Array.isArray(response.value)) {
          const mappedDrivers = response.value.map((d: any) => ({
            ...d,
            driverStatus: d.driverStatus as DriverStatus
          })) as Driver[]

          setDrivers(mappedDrivers)
          setTotalItems(mappedDrivers.length)
          setTotalPages(1)

          const busInfoMap: Record<string, any> = {}
          for (const driver of mappedDrivers) {
            if (driver.busId) {
              const cached = queryClient.getQueryData(["bus", driver.busId])
              if (cached) {
                busInfoMap[driver.busId] = cached
              } else {
                const busResp = await driverService.getByBusId(driver.busId)
                if (busResp.isSuccess && busResp.value) {
                  queryClient.setQueryData(["bus", driver.busId], busResp.value)
                  busInfoMap[driver.busId] = busResp.value
                }
              }
            }
          }
          setBusInfo(busInfoMap)
        } else {
          setError("Не удалось загрузить резервных водителей")
        }
      } else {
        const isNumeric = /^\d+$/.test(searchQuery.trim())
        const payload = {
          convoyId,
          driverStatus: selectedStatus ?? null,
          isInReserve: false,
          page: currentPage,
          pageSize,
          fullName: !isNumeric ? searchQuery : null,
          serviceNumber: isNumeric ? searchQuery : null,
          address: null,
          phone: null,
        }
        const response = await driverService.filter(payload)

        if (response.isSuccess && response.value && "items" in response.value) {
          const { items, totalCount, statusCounts } = response.value

          setDrivers(items)
          setTotalItems(totalCount)
          setTotalPages(Math.ceil(totalCount / pageSize))

          if (statusCounts) {
            setStatusCounts(calculateDriverTotal(statusCounts))
          }

          const busInfoMap: Record<string, any> = {}
          for (const driver of items) {
            if (driver.busId) {
              const cached = queryClient.getQueryData(["bus", driver.busId])
              if (cached) {
                busInfoMap[driver.busId] = cached
              } else {
                const busResp = await driverService.getByBusId(driver.busId)
                if (busResp.isSuccess && busResp.value) {
                  queryClient.setQueryData(["bus", driver.busId], busResp.value)
                  busInfoMap[driver.busId] = busResp.value
                }
              }
            }
          }
          setBusInfo(busInfoMap)
        } else {
          setError("Не удалось загрузить водителей")
        }
      }
    } catch (err) {
      console.error(err)
      setError("Произошла ошибка при загрузке данных")
    } finally {
      setLoading(false)
    }
  }, [convoyId, inReserve, selectedStatus, currentPage, pageSize, searchQuery, queryClient])

  useEffect(() => {
    if (convoyId) fetchDrivers()
  }, [fetchDrivers, convoyId])

  const addDriver = async (driverData: Omit<Driver, "id">) => {
    const res = await driverService.create(driverData)
    if (res.isSuccess) {
      await fetchDrivers()
      return true
    }
    setError(res.error || "Ошибка при добавлении")
    return false
  }

  const updateDriver = async (id: string, driverData: Omit<Driver, "id">) => {
    const res = await driverService.update(id, driverData)
    if (res.isSuccess) {
      await fetchDrivers()
      return true
    }
    setError(res.error || "Ошибка при обновлении")
    return false
  }

  const deleteDriver = async (id: string) => {
    const res = await driverService.delete(id)
    if (res.isSuccess) {
      await fetchDrivers()
      return true
    }
    setError(res.error || "Ошибка при удалении")
    return false
  }

  const addToReserve = async (id: string) => {
    const res = await driverService.getById(id)
    if (!res.isSuccess || !res.value) {
      setError("Не удалось получить данные водителя")
      return false
    }

    const updated = {
      ...res.value,
      lastBusId: res.value.busId,
      busId: null,
    }

    const save = await driverService.update(id, updated)
    if (!save.isSuccess) {
      setError("Не удалось обновить данные перед резервом")
      return false
    }

    const reserve = await registrationRequestService.addToReserve(id)
    if (reserve.isSuccess) {
      await fetchDrivers()
      return true
    }
    setError(reserve.error || "Ошибка при добавлении в резерв")
    return false
  }

  const removeFromReserve = async (id: string) => {
    const res = await driverService.getById(id)
    if (!res.isSuccess || !res.value) {
      setError("Не удалось получить данные водителя")
      return false
    }

    const updated = {
      ...res.value,
      busId: res.value.lastBusId || undefined,
      lastBusId: undefined,
    }

    const save = await driverService.update(id, updated)
    if (!save.isSuccess) {
      setError("Ошибка при возвращении из резерва")
      return false
    }

    const unreserve = await registrationRequestService.removeFromReserve(id)
    if (unreserve.isSuccess) {
      await fetchDrivers()
      return true
    }
    setError(unreserve.error || "Ошибка при снятии из резерва")
    return false
  }

  return {
    drivers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    inReserve,
    busInfo,
    statusCounts,
    selectedStatus,
    changePage: setCurrentPage,
    toggleReserve: setInReserve,
    filterByStatus: setSelectedStatus,
    addDriver,
    updateDriver,
    deleteDriver,
    addToReserve,
    removeFromReserve,
  }
}
