import type { RouteExitRepairStatus } from "@/types/routeExitRepair.types"

export const repairTypeLabels: Record<RouteExitRepairStatus, string> = {
  Unscheduled: "Неплановый ремонт",
  Other: "Прочий ремонт",
  LongTerm: "Длительный ремонт",
}

export const allRepairTypes: RouteExitRepairStatus[] = [
  "Unscheduled",
  "Other",
  "LongTerm",
]

export const normalizeRepairType = (type: string): RouteExitRepairStatus | null => {
  const normalized = type.trim().toLowerCase()
  const map: Record<string, RouteExitRepairStatus> = {
    unscheduled: "Unscheduled",
    other: "Other",
    longterm: "LongTerm",
  }
  return map[normalized] || null
}
