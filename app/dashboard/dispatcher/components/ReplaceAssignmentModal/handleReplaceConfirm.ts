import { toast } from "@/components/ui/use-toast"
import { releasePlanService } from "@/service/releasePlanService"
import { DispatchBusLineStatus, RouteAssignment, ReserveReplacementCandidate } from "@/types/releasePlanTypes"
import { DisplayBus } from "@/types/bus.types"
import { DisplayDriver } from "@/types/driver.types"

interface HandleReplaceConfirmParams {
  selectedAssignment: RouteAssignment
  selectedBus: DisplayBus | null
  selectedDriver: DisplayDriver | null
  reserve: ReserveReplacementCandidate[]
  replacementType: string
  onReplaceSuccess?: (updated: RouteAssignment) => void
  onReload?: () => void
  onClose: () => void
}

export async function handleReplaceConfirm({
  selectedAssignment,
  selectedBus,
  selectedDriver,
  reserve,
  replacementType,
  onReplaceSuccess,
  onReload,
  onClose,
}: HandleReplaceConfirmParams) {
  if (!selectedBus && !selectedDriver) {
    toast({ title: "Выберите водителя или автобус", variant: "destructive" })
    return
  }

  const isBusChanged = !!selectedBus && selectedBus.id !== selectedAssignment.bus?.id
  const isDriverChanged = !!selectedDriver && selectedDriver.id !== selectedAssignment.driver?.id

  const isFromReserve =
    selectedDriver && selectedBus &&
    reserve.some((r) => r.driverId === selectedDriver.id && r.busId === selectedBus.id)

  if (!isFromReserve && !isBusChanged && !isDriverChanged) {
    toast({ title: "Вы не выбрали другую замену", variant: "destructive" })
    return
  }

  try {
    const res = await releasePlanService.replaceAssignment(
      selectedAssignment.dispatchBusLineId,
      true,
      replacementType,
      selectedDriver?.id || selectedAssignment.driver?.id || "",
      selectedBus?.id || selectedAssignment.bus?.id || ""
    )

    if (replacementType === "Replaced") {
      const reserveEntry = reserve.find(
        (r) => r.driverId === selectedDriver?.id && r.busId === selectedBus?.id
      )

      if (reserveEntry) {
        await releasePlanService.removeFromReserve([reserveEntry.id])
      }
    }

    toast({
      title: "Назначение обновлено",
      description: `✅ Замена выполнена (${replacementType})`,
    })

    if (res?.value && onReplaceSuccess) {
      onReplaceSuccess({
        ...selectedAssignment,
        bus: selectedBus
          ? {
              id: selectedBus.id,
              garageNumber: selectedBus.garageNumber,
              govNumber: selectedBus.govNumber,
            }
          : selectedAssignment.bus,
        garageNumber: selectedBus?.garageNumber ?? selectedAssignment.garageNumber,
        stateNumber: selectedBus?.govNumber ?? selectedAssignment.stateNumber,
        driver: selectedDriver
          ? {
              id: selectedDriver.id,
              fullName: selectedDriver.fullName,
              serviceNumber: selectedDriver.serviceNumber,
            }
          : selectedAssignment.driver,
        status: replacementType === "Replaced"
          ? DispatchBusLineStatus.Replaced
          : DispatchBusLineStatus.Permutation,
      })
    }

    onReload?.()
    onClose()
  } catch (error: any) {
    toast({ title: "Ошибка при замене", description: error.message, variant: "destructive" })
  }
}
