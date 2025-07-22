import { toast } from "@/components/ui/use-toast"
import { releasePlanService } from "@/service/releasePlanService"
import {
  DispatchBusLineStatus,
  RouteAssignment,
  ReserveReplacementCandidate,
} from "@/types/releasePlanTypes"
import { DisplayBus } from "@/types/bus.types"
import { DisplayDriver } from "@/types/driver.types"

interface HandleReplaceConfirmParams {
  selectedAssignment: RouteAssignment
  isFirstShift: boolean
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
  isFirstShift,
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

  const driverId = selectedDriver?.id ?? selectedAssignment.driver?.id ?? ""
  const busId = selectedBus?.id ?? selectedAssignment.bus?.id ?? ""

  const isBusChanged = !!selectedBus && selectedBus.id !== selectedAssignment.bus?.id
  const isDriverChanged = !!selectedDriver && selectedDriver.id !== selectedAssignment.driver?.id

  const isFromReserve =
    selectedDriver &&
    selectedBus &&
    reserve.some((r) => r.driverId === selectedDriver.id && r.busId === selectedBus.id)

  if (!isFromReserve && !isBusChanged && !isDriverChanged) {
    toast({ title: "Вы не выбрали другую замену", variant: "destructive" })
    return
  }

  try {
    const response = await releasePlanService.replaceAssignment(
      selectedAssignment.dispatchBusLineId,
      isFirstShift,
      replacementType,
      driverId,
      busId
    )

    // Удалить из резерва при обычной замене
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

    // Обновляем состояние
    if (response?.isSuccess && onReplaceSuccess) {
      const replacementTypeToStatusMap: Record<string, DispatchBusLineStatus> = {
        Replaced: DispatchBusLineStatus.Replaced,
        Permutation: DispatchBusLineStatus.Permutation,
        RearrangingRoute: DispatchBusLineStatus.RearrangingRoute,
        RearrangementRenovation: DispatchBusLineStatus.RearrangementRenovation,
        Oder: DispatchBusLineStatus.Oder, // ❗ если сервер требует именно "Oder" — оставим, но это подозрительно
      }

      const newStatus =
        replacementTypeToStatusMap[replacementType] ?? DispatchBusLineStatus.Undefined

      onReplaceSuccess({
        ...selectedAssignment,
        bus: selectedBus ?? selectedAssignment.bus,
        garageNumber: selectedBus?.garageNumber ?? selectedAssignment.garageNumber,
        stateNumber: selectedBus?.govNumber ?? selectedAssignment.stateNumber,
        driver: selectedDriver ?? selectedAssignment.driver,
        status: newStatus,
      })
    }

    onReload?.()
    onClose()
  } catch (error: any) {
    toast({
      title: "Ошибка при замене",
      description: error?.message || "Произошла ошибка",
      variant: "destructive",
    })
    console.error("Ошибка при замене:", error)
  }
}
