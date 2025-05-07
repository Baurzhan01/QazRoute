// types/statusMaps.ts
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"

export const driverStatusMap: Record<DisplayDriver["driverStatus"], string> = {
  OnWork: "Активен",
  DayOff: "Выходной",
  OnVacation: "В отпуске",
  OnSickLeave: "Болен",
  Intern: "Стажёр",
  Fired: "Уволен",
}

export const busStatusMap: Record<DisplayBus["status"], string> = {
  OnWork: "На линии",
  UnderRepair: "На ремонте",
  LongTermRepair: "Длительный ремонт",
  DayOff: "Выходной",
  Decommissioned: "Списан",
}
