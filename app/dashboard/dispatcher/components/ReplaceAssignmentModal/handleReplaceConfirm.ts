import { toast } from "@/components/ui/use-toast"
import { releasePlanService } from "@/service/releasePlanService"
import { actionLogService } from "@/service/actionLogService"
import { statementsService } from "@/service/statementsService"
import type { StatementStatus } from "@/types/statement.types"
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
  convoyId?: string | null
  swap: boolean
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
  convoyId,
  swap,
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
      busId,
      swap // ⬅️ добавлено
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
          // 2. Описание (для текстового поля без иконок)
          let description = ""

          const prevDriver = selectedAssignment.driver
          const prevBus = selectedAssignment.bus

          if (replacementType === "Replaced") {
            // 🔁 Замена с резерва
            description = `Снят: ${formatShortFIO(prevDriver?.fullName ?? "")} (таб. №${prevDriver?.serviceNumber ?? "—"}), автобус ${prevBus?.garageNumber ?? "—"}`
          } else if (replacementType === "Permutation") {
            const oldDriver = selectedAssignment.driver?.fullName || ""
            const newDriver = selectedDriver?.fullName || ""
            const oldBus = selectedAssignment.bus?.garageNumber || ""
            const newBus = selectedBus?.garageNumber || ""

            const isBusChanged = selectedBus && selectedBus.id !== selectedAssignment.bus?.id
            const isDriverChanged = selectedDriver && selectedDriver.id !== selectedAssignment.driver?.id

            if (isBusChanged && !isDriverChanged) {
              description = `Перестановка автобусов: ${oldBus} → ${newBus}`
            } else if (isDriverChanged && !isBusChanged) {
              description = `Перестановка водителя: ${formatShortFIO(oldDriver)} → ${formatShortFIO(newDriver)}`
            } else {
              description = `Перестановка: ${formatShortFIO(prevDriver?.fullName ?? "")} (таб. №${prevDriver?.serviceNumber ?? "—"}), автобус ${prevBus?.garageNumber ?? "—"}`
            }
          } else if (replacementType === "RearrangingRoute") {
            // 🔄 Перестановка по маршруту
            description = `Перестановка: ${formatShortFIO(prevDriver?.fullName ?? "")} (таб. №${prevDriver?.serviceNumber ?? "—"}), автобус ${prevBus?.garageNumber ?? "—"}`
          }

 
      await releasePlanService.updateBusLineDescription(
        selectedAssignment.dispatchBusLineId,
        date,
        description
      )

      // Try to append an ActionLog entry reflecting the replacement
      try {
        // Resolve statementId via helper
        let statementId = convoyId
          ? await releasePlanService.findStatementIdByDispatch(
              date,
              convoyId,
              selectedAssignment.dispatchBusLineId
            )
          : null

        if (!statementId && convoyId) {
          try {
            const list = await statementsService.getByConvoyAndDate(convoyId, date)
            statementId = list.value?.[0]?.id ?? null
          } catch {}
        }

        if (statementId) {
          const now = new Date()
          const pad = (n: number) => n.toString().padStart(2, "0")
          const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

          // Map replacement type to a concise action status label if possible
          const mapReplacementToActionStatus = (t: string): string => {
            switch (t) {
              case "Replaced":
                return "Replace"
              case "Permutation":
              case "RearrangingRoute":
                return "Rearrangement"
              case "RearrangementRenovation":
                return "RearrangementRenovation"
              case "Order":
                return "Order"
              default:
                return t
            }
          }

          const statementStatus: StatementStatus = "OnWork"

          await actionLogService.create({
            statementId,
            time,
            driverId: selectedDriver?.id ?? selectedAssignment.driver?.id ?? null,
            busId: selectedBus?.id ?? selectedAssignment.bus?.id ?? null,
            revolutionCount: 0,
            description,
            statementStatus,
            actionStatus: mapReplacementToActionStatus(replacementType),
          })
        }
      } catch (e) {
        // Non-blocking: log errors but do not interrupt UX
        console.warn("action log create failed for replacement", e)
      }
      

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
