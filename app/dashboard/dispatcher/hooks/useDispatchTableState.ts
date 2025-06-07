// ✅ useDispatchTableState.ts — обновлён для корректной синхронизации чекбоксов и releasedTime
import { useEffect, useState } from "react"
import type { Driver } from "@/types/driver.types"
import type { FinalDispatchData } from "@/types/releasePlanTypes"

export function useDispatchTableState(data: FinalDispatchData | null) {
  const [fuelNorms, setFuelNorms] = useState<Record<string, string>>({})
  const [checkedDepartures, setCheckedDepartures] = useState<Record<string, boolean>>({})
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [replaceModalOpen, setReplaceModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showDayOffDrivers, setShowDayOffDrivers] = useState(true)

  // Чекбоксы: обновляем, если status === 1 или есть releasedTime
  useEffect(() => {
    if (!data?.routeGroups) return
  
    setCheckedDepartures((prev) => {
      const updated: Record<string, boolean> = { ...prev }
  
      data.routeGroups.forEach(group => {
        group.assignments.forEach(a => {
          const id = a.dispatchBusLineId
          // Обновляем только если не установлено ранее вручную
          if (!(id in updated)) {
            updated[id] = a.isRealsed === true
          }
        })
      })
  
      return updated
    })
  }, [data])  

  return {
    fuelNorms,
    setFuelNorms,
    checkedDepartures,
    setCheckedDepartures,
    selectedAssignment,
    setSelectedAssignment,
    replaceModalOpen,
    setReplaceModalOpen,
    selectedDriver,
    setSelectedDriver,
    dialogOpen,
    setDialogOpen,
    showDayOffDrivers,
    setShowDayOffDrivers,
  }
}
