import { useState } from "react"
import { releasePlanService } from "@/service/releasePlanService"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"

interface UseStatusSyncOptions {
  initialChecked: Record<string, boolean>
}

export function useStatusSync({ initialChecked }: UseStatusSyncOptions) {
  const [checkedMap, setCheckedMap] = useState(initialChecked)

  const handleCheckboxChange = async (
    assignment: {
      dispatchBusLineId: string
      status?: number
    },
    checked: boolean,
    onUpdate?: (updated: {
      id: string
      status: number
      isRealsed: boolean
      releasedTime: string
    }) => void
  ) => {
    const dispatchId = assignment.dispatchBusLineId
    const currentStatus = assignment.status ?? DispatchBusLineStatus.Undefined

    let newStatus = currentStatus
    let isRealsed = checked
    let releasedTime = checked ? new Date().toISOString().slice(11, 19) : ""

    if (checked) {
      if (currentStatus === DispatchBusLineStatus.Undefined) {
        newStatus = DispatchBusLineStatus.Released
      }
    } else {
      isRealsed = false
      releasedTime = ""
      if (currentStatus === DispatchBusLineStatus.Released) {
        newStatus = DispatchBusLineStatus.Undefined
      }
    }

    setCheckedMap((prev) => ({ ...prev, [dispatchId]: checked }))

    try {
      await releasePlanService.updateDispatchStatus(dispatchId, newStatus, isRealsed)
      onUpdate?.({
        id: dispatchId,
        status: newStatus,
        isRealsed,
        releasedTime,
      })
    } catch (err) {
      console.error("Ошибка обновления статуса:", err)
      setCheckedMap((prev) => ({ ...prev, [dispatchId]: !checked }))
    }
  }

  return {
    checkedMap,
    handleCheckboxChange,
    setCheckedMap,
  }
}
