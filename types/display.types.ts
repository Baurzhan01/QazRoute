import type { BusStatus } from "./bus.types"
import type { DriverStatus } from "./driver.types"

export const driverStatusMap: Record<DriverStatus, string> = {
  OnWork: "На работе",
  DayOff: "Выходной",
  OnVacation: "В отпуске",
  OnSickLeave: "Больничный",
  Intern: "Стажировка",
  Fired: "Уволен",
}

export const busStatusMap: Record<BusStatus, string> = {
  OnWork: "На линии",
  UnderRepair: "На ремонте",
  LongTermRepair: "Длительный ремонт",
  DayOff: "Выходной",
  Decommissioned: "Списан",
}
