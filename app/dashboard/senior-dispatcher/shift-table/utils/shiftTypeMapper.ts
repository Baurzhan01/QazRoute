import type { WorkShiftType } from "@/types/coordinator.types"
import type { ShiftType } from "../types/shift.types"

// Преобразование ShiftType → WorkShiftType
export const shiftToApi = (shift: ShiftType): WorkShiftType => {
  switch (shift) {
    case "day": return "Day"
    case "night": return "Night"
    case "vacation": return "Vacation"
    case "dayOff": return "DayOff"
    case "skip": return "Skip"
    default: return "Day"
  }
}

// Обратное преобразование
export const apiToShift = (shift: WorkShiftType): ShiftType => {
  switch (shift) {
    case "Day": return "day"
    case "Night": return "night"
    case "Vacation": return "vacation"
    case "DayOff": return "dayOff"
    case "Skip": return "skip"
    default: return "day"
  }
}
