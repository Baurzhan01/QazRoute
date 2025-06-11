import { useState, useEffect, useCallback } from "react"
import { repairService } from "@/service/repairService"
import { getAuthData } from "@/lib/auth-utils"
import type { RepairDto } from "@/types/repair.types"
import type { DisplayDriver, DriverStatus } from "@/types/driver.types"
import type { DisplayBus } from "@/types/bus.types"

export interface RepairRecord {
  driver: DisplayDriver
  bus: DisplayBus
  description: string
}

export function usePlannedRepairs(date: Date) {
  const convoyId = getAuthData()?.convoyId ?? ""
  const [repairs, setRepairs] = useState<RepairRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchRepairs = useCallback(async () => {
    setIsLoading(true)
    try {
      const dateStr = date.toISOString().split("T")[0]
      const res = await repairService.getRepairsByDate(dateStr, convoyId)
      const entries: RepairDto[] = res?.value ?? []

      const mapped: RepairRecord[] = entries.map((entry) => ({
        bus: {
          id: entry.bus.id,
          govNumber: entry.bus.govNumber,
          garageNumber: entry.bus.garageNumber,
          busStatus: "OnWork", // или "Unknown" as BusStatus, если тип позволяет
          isAssigned: false,
          isBusy: false
        },
        driver: {
          id: entry.driver.id,
          fullName: entry.driver.fullName,
          serviceNumber: entry.driver.serviceNumber,
          driverStatus: "OnWork" as DriverStatus,
          isAssigned: false,
          isBusy: false
        },
        description: entry.description
      }))
      

      setRepairs(mapped)
    } catch (e) {
      console.error("Ошибка загрузки ремонтов:", e)
      setRepairs([])
    } finally {
      setIsLoading(false)
    }
  }, [date, convoyId])

  useEffect(() => {
    fetchRepairs()
  }, [fetchRepairs])

  const toInputDto = (record: RepairRecord) => ({
    busId: record.bus.id,
    driverId: record.driver.id,
    description: record.description
  })

  const deleteRepair = async (record: RepairRecord) => {
    const dateStr = date.toISOString().split("T")[0]
    await repairService.deleteRepairs(dateStr, [toInputDto(record)])
    await fetchRepairs()
  }

  const updateRepair = async (record: RepairRecord) => {
    const dateStr = date.toISOString().split("T")[0]
    await repairService.updateRepair(dateStr, convoyId, toInputDto(record))
    await fetchRepairs()
  }

  const assignRepair = async (record: RepairRecord) => {
    const dateStr = date.toISOString().split("T")[0]
    await repairService.assignRepairs(dateStr, convoyId, [toInputDto(record)])
    await fetchRepairs()
  }

  return {
    repairs,
    isLoading,
    fetchRepairs,
    assignRepair,
    deleteRepair,
    updateRepair
  }
}
