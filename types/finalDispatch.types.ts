import type { Driver } from "./driver.types"

export interface RouteAssignment {
  routeNumber: string
  garageNumber: string
  stateNumber: string
  driver: Driver
  departureTime: string
  scheduleTime: string
  endTime: string
  additionalInfo: string
  shift2Driver?: Driver
  shift2AdditionalInfo?: string
  notes?: string
  departureNumber: number
}

export interface RouteGroup {
  routeId: string
  routeNumber: string
  assignments: RouteAssignment[]
}

export interface ReserveAssignment {
  sequenceNumber: number
  garageNumber: string
  stateNumber: string
  driver: Driver
  departureTime: string
  scheduleTime: string
  additionalInfo: string
  shift2Driver?: Driver
  shift2AdditionalInfo?: string
  endTime: string
}

export type FinalDispatchEntry = {
  routeNumber: string | null
  busGovNumber: string | null
  busGarageNumber: string | null
  driverFullName: string | null
  shiftType: "first" | "second"
  shiftStartTime: string | null
  shiftEndTime: string | null
  changeTime: string | null
}

export interface FinalDispatchData {
  date: string
  routeGroups: RouteGroup[]
  reserveAssignments: ReserveAssignment[]
  repairBuses: string[]
  dayOffBuses: string[]
  driverStatuses: {
    DayOff?: string[]
    OnVacation?: string[]
    OnSickLeave?: string[]
    Intern?: string[]
    total?: number
  }
}
