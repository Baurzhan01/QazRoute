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
  date: string
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
  date,
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

    if (response?.isSuccess && onReplaceSuccess) {
      const replacementTypeToStatusMap: Record<string, DispatchBusLineStatus> = {
        Replaced: DispatchBusLineStatus.Replaced,
        Permutation: DispatchBusLineStatus.Permutation,
        RearrangingRoute: DispatchBusLineStatus.RearrangingRoute,
        RearrangementRenovation: DispatchBusLineStatus.RearrangementRenovation,
        Oder: DispatchBusLineStatus.Oder,
      }

      const newStatus =
        replacementType === "RearrangingRoute"
          ? DispatchBusLineStatus.RearrangingRoute
          : replacementTypeToStatusMap[replacementType] ?? DispatchBusLineStatus.Undefined

          const formatShortFIO = (fullName: string) => {
            const [last, first, middle] = fullName.split(" ")
            const initials = [first?.[0], middle?.[0]].filter(Boolean).join(".")
            return `${last} ${initials}.`
          }
          
          // 1. Доп. инфо для UI (цветная строка с иконками)
          let additionalInfo = ""
          
          if (replacementType === "Replaced") {
            additionalInfo = `🔁 Замена с резерва`
          } else if (replacementType === "Permutation" || replacementType === "RearrangingRoute") {
            const oldDriver = selectedAssignment.driver?.fullName || ""
            const newDriver = selectedDriver?.fullName || ""
            const oldBus = selectedAssignment.bus?.garageNumber || ""
            const newBus = selectedBus?.garageNumber || ""
          
            const parts = []
            if (oldBus && newBus) parts.push(`🚌 ${oldBus} → ${newBus}`)
            if (oldDriver && newDriver) parts.push(`👤 ${formatShortFIO(oldDriver)} → ${formatShortFIO(newDriver)}`)
          
            additionalInfo =
              replacementType === "Permutation"
                ? `🔄 Перестановка: ${parts.join(" · ")}`
                : `🔄 Перестановка по маршруту: ${parts.join(" · ")}`
          }
          
          // 2. Описание (для текстового поля без иконок)
          const prevDriver = selectedAssignment.driver
          const prevBus = selectedAssignment.bus
          const description = `Снят: ${formatShortFIO(prevDriver?.fullName ?? "")} (таб. №${prevDriver?.serviceNumber ?? "—"}), автобус ${prevBus?.garageNumber ?? "—"}`
          
      await releasePlanService.updateBusLineDescription(
        selectedAssignment.dispatchBusLineId,
        date,
        description
      )
      

      onReplaceSuccess({
        ...selectedAssignment,
        bus: selectedBus ?? selectedAssignment.bus,
        garageNumber: selectedBus?.garageNumber ?? selectedAssignment.garageNumber,
        stateNumber: selectedBus?.govNumber ?? selectedAssignment.stateNumber,
        driver: selectedDriver ?? selectedAssignment.driver,
        status: newStatus,
        oldBus: selectedAssignment.bus,
        oldDriver: selectedAssignment.driver,
        replacementType,
        additionalInfo,
        description, // ⬅️ ВАЖНО!
      } as RouteAssignment & {
        oldBus?: { garageNumber?: string; stateNumber?: string }
        oldDriver?: { fullName?: string }
        replacementType?: string
        additionalInfo?: string
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
