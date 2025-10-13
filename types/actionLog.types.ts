// app/types/actionLog.types.ts
import type { StatementStatus } from "@/types/statement.types"

export type ActionLogStatus =
  | "Code102" | "Gps" | "OffRoad" | "DriverIllness" | "DriverGsmFault"
  | "DriverStkFault" | "EmergencyCall" | "AdditionalRevolutions"
  | "Accident" | "DriverAccident" | "MidShiftCharging" | "TrafficJam"
  | "NoCharging" | "NoRoute" | "LowFuel" | "ScheduleAhead" | "DriverDelay"
  | "Distraction" | "NoPassengers" | "Rearrangement" | "GlDeparture"
  | "PersonalReason" | "Order" | "MissedRevolution" | "NotDriverFault"
  | "FromGarage" | "MidShift" | "TechnicalIssue" | "Emergency" | "Replace" |"Return"

export interface ActionLogTimeResponse {
  hour: number
  minute: number
  second: number
  millisecond: number
  microsecond: number
  nanosecond: number
  ticks: number
}

export interface ActionLog {
  id: string
  statementId: string
  time: ActionLogTimeResponse
  revolutionCount: number
  description: string
  status: ActionLogStatus
  actionStatus: string
  statementStatus: string
  busId?: string | null
  driverId?: string | null
}

export interface ActionLogPayload {
  id?: string
  statementId: string
  time: string // формат "HH:mm:ss"
  driverId?: string | null
  busId?: string | null
  revolutionCount: number
  description?: string | null
  statementStatus: StatementStatus // ✅ строго типизировано
  actionStatus: string
}