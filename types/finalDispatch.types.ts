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

export type FinalDispatchData = {
  entries: FinalDispatchEntry[];  // ✅ ДОБАВИТЬ ЭТО ПОЛЕ
  id: string;
  date: string;
  dayType: string;
  routes: any[];  
  reserves: any[]; 
}