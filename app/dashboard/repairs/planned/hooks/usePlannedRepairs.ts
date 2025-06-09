import { useState, useEffect, useCallback } from "react"
import { repairService } from "@/service/repairService"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import { getAuthData } from "@/lib/auth-utils"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import type { Bus } from "@/types/bus.types"
import type { Driver } from "@/types/driver.types"

export interface RepairRecord {
  driver: DisplayDriver
  bus: DisplayBus
  description: string
}

export interface RawRepairEntry {
  busId: string
  driverId: string
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
      const entries: RawRepairEntry[] = res?.value ?? []

      const enriched: RepairRecord[] = await Promise.all(
        entries.map(async (entry) => {
          const [busRes, driverRes] = await Promise.all([
            busService.getById(entry.busId),
            driverService.getById(entry.driverId)
          ])

          const bus: Bus = busRes.value!
          const driver: Driver = driverRes.value!

          return {
            bus: {
              id: bus.id ?? "",
              garageNumber: bus.garageNumber,
              govNumber: bus.govNumber,
              busStatus: bus.busStatus,
              isAssigned: false,
              isBusy: false
            },
            driver: {
              id: driver.id ?? "",
              fullName: driver.fullName,
              serviceNumber: driver.serviceNumber,
              driverStatus: driver.driverStatus,
              isAssigned: false,
              isBusy: false
            },
            description: entry.description,
          }
        })
      )

      setRepairs(enriched)
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

  const deleteRepair = async (record: RepairRecord) => {
    try {
      const dateStr = date.toISOString().split("T")[0]
      await repairService.deleteRepairs(dateStr, [{
        busId: record.bus.id,
        driverId: record.driver.id,
        description: record.description,
      }])
      await fetchRepairs()
    } catch (e) {
      console.error("Ошибка удаления ремонта:", e)
    }
  }

  const updateRepair = async (record: RepairRecord) => {
    try {
      const dateStr = date.toISOString().split("T")[0]
      await repairService.updateRepair(dateStr, convoyId, {
        busId: record.bus.id,
        driverId: record.driver.id,
        description: record.description,
      })
      await fetchRepairs()
    } catch (e) {
      console.error("Ошибка обновления ремонта:", e)
    }
  }

  const assignRepair = async (record: RepairRecord) => {
    try {
      const dateStr = date.toISOString().split("T")[0]
      await repairService.assignRepairs(dateStr, convoyId, [{
        busId: record.bus.id,
        driverId: record.driver.id,
        description: record.description,
      }])
      await fetchRepairs()
    } catch (e) {
      console.error("Ошибка назначения ремонта:", e)
    }
  }

  return {
    repairs,
    isLoading,
    fetchRepairs,
    assignRepair,
    deleteRepair,
    updateRepair,
  }
}
