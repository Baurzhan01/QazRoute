import type { ReserveAssignmentUI } from "@/types/releasePlanTypes"

export function mapToReserveAssignmentUI(
    item: any,
    index: number,
    status: "Reserved" | "Order"
  ): ReserveAssignmentUI {
    return {
      id: item.id,
      sequenceNumber: item.sequenceNumber ?? index + 1,
      departureTime: item.departureTime ?? "—",
      scheduleTime: item.scheduleTime ?? "—",
      endTime: item.endTime ?? "—",
      garageNumber: item.garageNumber ?? "—",
      govNumber: item.govNumber ?? "—",
      busId: null,
      driver: item.driver
        ? {
            id: item.driver.id,
            fullName: item.driver.fullName,
            serviceNumber: item.driver.serviceNumber,
          }
        : undefined,
      additionalInfo: item.additionalInfo ?? "",
      status,
      isReplace: item.isReplace ?? false,
    }
  }
  