import { releasePlanService } from "@/service/releasePlanService"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import type { ReserveReplacementCandidate, RouteAssignment } from "@/types/releasePlanTypes"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"

interface UseReplacementLogicParams {
  selectedAssignment: RouteAssignment
  selectedDriver: DisplayDriver | null
  selectedBus: DisplayBus | null
  reserve: ReserveReplacementCandidate[]
}

export function useReplacementLogic({
  selectedAssignment,
  selectedDriver,
  selectedBus,
  reserve,
}: UseReplacementLogicParams) {
  const isBusChanged = !!selectedBus && selectedBus.id !== selectedAssignment.bus?.id
  const isDriverChanged = !!selectedDriver && selectedDriver.id !== selectedAssignment.driver?.id

  const isFromReserve =
    selectedDriver &&
    selectedBus &&
    reserve.some((r) => r.driverId === selectedDriver.id && r.busId === selectedBus.id)

  const status: DispatchBusLineStatus | null = isFromReserve
    ? DispatchBusLineStatus.Replaced
    : isBusChanged || isDriverChanged
    ? DispatchBusLineStatus.Permutation
    : null

  const isValid = !!status

  const getNormalizedDriverId = () =>
    selectedDriver?.id || selectedAssignment.driver?.id || ""

  const getNormalizedBusId = () =>
    selectedBus?.id || selectedAssignment.bus?.id || ""

  const errorMessage = !isValid
    ? "Вы не выбрали новую замену или перестановку"
    : undefined

    const submitReplacement = async () => {
        if (!status) throw new Error("Неверное состояние замены")
      
        const driverId = getNormalizedDriverId()
        const busId = getNormalizedBusId()
        const replacementType = status === DispatchBusLineStatus.Replaced ? "Replaced" : "Permutation"
      
        const response = await releasePlanService.replaceAssignment(
          selectedAssignment.dispatchBusLineId,
          true, // всегда первая смена
          replacementType,
          driverId,
          busId
        )
      
        if (!response.isSuccess) {
          throw new Error("Сервер вернул ошибку при замене")
        }
      
        return {
          updated: {
            ...selectedAssignment,
            bus: selectedBus ?? selectedAssignment.bus,
            driver: selectedDriver ?? selectedAssignment.driver,
            garageNumber: selectedBus?.garageNumber ?? selectedAssignment.garageNumber,
            stateNumber: selectedBus?.govNumber ?? selectedAssignment.stateNumber,
            status,
          },
          status,
        }
      }
      

  return {
    status,
    isValid,
    isFromReserve,
    errorMessage,
    submitReplacement,
  }
}
