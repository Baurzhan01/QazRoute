// src/constants/repairTypeLabels.ts
import type { RouteExitRepairStatus } from "@/types/routeExitRepair.types"

export const repairTypeLabels: Record<RouteExitRepairStatus, string> = {
  Unscheduled: "Неплановый ремонт",
  Other: "Прочий ремонт",
  LongTerm: "Длительный ремонт",
}
