import type { ReserveAssignmentUI, ReserveAssignment, OrderAssignment } from "@/types/releasePlanTypes"

export function mapToReserveAssignmentUI(
  r: ReserveAssignment | OrderAssignment,
  i: number,
  status: "Reserved" | "Order"
): ReserveAssignmentUI {
  return {
    id: r.id,
    sequenceNumber: r.sequenceNumber ?? i + 1,
    departureTime: r.departureTime ?? "—",
    scheduleTime: r.scheduleTime ?? "—",
    endTime: r.endTime ?? "—",
    garageNumber: r.garageNumber ?? "—",
    govNumber: r.govNumber ?? "—",
    busId: 'busId' in r ? r.busId ?? null : null,
    driver: r.driver,
    additionalInfo: r.additionalInfo ?? "",
    status,
    isReplace: 'isReplace' in r ? r.isReplace : false,
  }
}
