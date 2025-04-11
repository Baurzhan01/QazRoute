  "use client"

  import { useState, useEffect, useCallback } from "react"
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
      if (!convoyId) return
      const fetchStatusStats = async () => {
        try {
          const response = await driverService.getStatusStats(convoyId)
          if (response.isSuccess && response.value) {
            const countsWithTotal = calculateDriverTotal(response.value)
            setStatusCounts(countsWithTotal)
          }
        } catch (err) {
          console.error("Ошибка при загрузке статистики по статусам", err)
        }
      }
      fetchStatusStats()
    }, [convoyId])

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
            for (const driver of drivers) {
              if (driver.busId) {
                const busResp = await driverService.getByBusId(driver.busId)
                if (busResp.isSuccess && busResp.value) {
                  busInfoMap[driver.busId] = busResp.value
                }
              }
            }
            setBusInfo(busInfoMap)
          } else {
            setError("Не удалось загрузить резервных водителей")
          }
        } else {
          const payload = {
            convoyId,
            driverStatus: selectedStatus ?? null,
            isInReserve: false,
            page: currentPage,
            pageSize,
            fullName: searchQuery.length > 0 ? searchQuery : null,
            serviceNumber: null,
            address: null,
            phone: null,
          }        
          const response = await driverService.filter(payload)

          if (response.isSuccess && response.value && "items" in response.value) {
            const { items, totalCount, statusCounts } = response.value

            setDrivers(items)
            setTotalItems(totalCount)
            setTotalPages(Math.ceil(totalCount / pageSize))

            const countsWithTotal = calculateDriverTotal(statusCounts)
            setStatusCounts(countsWithTotal)

            const busInfoMap: Record<string, any> = {}
            for (const driver of items) {
              if (driver.busId) {
                const busResp = await driverService.getByBusId(driver.busId)
                if (busResp.isSuccess && busResp.value) {
                  busInfoMap[driver.busId] = busResp.value
                }
              }
            }
            setBusInfo(busInfoMap)
          } else {
            setError("Не удалось загрузить водителей (неожиданный формат ответа)")
          }
        }
      } catch (err) {
        setError("Произошла ошибка при загрузке данных")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, [inReserve, convoyId, selectedStatus, currentPage, pageSize, searchQuery])

    useEffect(() => {
      if (convoyId) {
        fetchDrivers()
      }
    }, [fetchDrivers, convoyId])

    const addDriver = async (driverData: Omit<Driver, "id">) => {
      try {
        const response = await driverService.create(driverData)
        if (response.isSuccess) {
          fetchDrivers()
          return true
        } else {
          setError(response.error || "Не удалось добавить водителя")
          return false
        }
      } catch (err) {
        setError("Ошибка при добавлении водителя")
        return false
      }
    }

    const updateDriver = async (id: string, driverData: Omit<Driver, "id">) => {
      try {
        const response = await driverService.update(id, driverData)
        if (response.isSuccess) {
          fetchDrivers()
          return true
        } else {
          setError(response.error || "Не удалось обновить водителя")
          return false
        }
      } catch (err) {
        setError("Ошибка при обновлении данных")
        return false
      }
    }

    const deleteDriver = async (id: string) => {
      try {
        const response = await driverService.delete(id)
        if (response.isSuccess) {
          fetchDrivers()
          return true
        } else {
          setError(response.error || "Не удалось удалить водителя")
          return false
        }
      } catch (err) {
        setError("Ошибка при удалении водителя")
        return false
      }
    }

    const addToReserve = async (id: string) => {
      try {
        const driverResp = await driverService.getById(id)
        if (!driverResp.isSuccess || !driverResp.value) {
          setError("Не удалось получить данные водителя")
          return false
        }

        const driver = driverResp.value
        const update = {
          ...driver,
          lastBusId: driver.busId,
          busId: null,
        }

        const updateResp = await driverService.update(id, update)
        if (!updateResp.isSuccess) {
          setError("Не удалось сохранить изменения перед добавлением в резерв")
          return false
        }

        const reserveResp = await registrationRequestService.addToReserve(id)
        if (reserveResp.isSuccess) {
          fetchDrivers()
          return true
        } else {
          setError(reserveResp.error || "Ошибка при добавлении в резерв")
          return false
        }
      } catch (err) {
        setError("Ошибка при работе с резервом")
        return false
      }
    }

    const removeFromReserve = async (id: string) => {
      try {
        const driverResp = await driverService.getById(id)
        if (!driverResp.isSuccess || !driverResp.value) {
          setError("Не удалось получить данные водителя")
          return false
        }

        const driver = driverResp.value
        const update = {
          ...driver,
          busId: driver.lastBusId || undefined,
          lastBusId: undefined,
        }

        const updateResp = await driverService.update(id, update)
        if (!updateResp.isSuccess) {
          setError("Не удалось вернуть водителя из резерва")
          return false
        }

        const reserveResp = await registrationRequestService.removeFromReserve(id)
        if (reserveResp.isSuccess) {
          fetchDrivers()
          return true
        } else {
          setError(reserveResp.error || "Ошибка при удалении из резерва")
          return false
        }
      } catch (err) {
        setError("Ошибка при возвращении из резерва")
        return false
      }
    }

    const changePage = (page: number) => setCurrentPage(page)
    const toggleReserve = (value: boolean) => {
      setInReserve(value)
      setCurrentPage(1)
    }
    const filterByStatus = (status: DriverStatus | null) => {
      setSelectedStatus(status)
      setCurrentPage(1)
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
      addDriver,
      updateDriver,
      deleteDriver,
      addToReserve,
      removeFromReserve,
      changePage,
      toggleReserve,
      filterByStatus,
    }
  }
