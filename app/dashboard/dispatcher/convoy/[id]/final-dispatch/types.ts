import type { ActionLogStatus } from "@/types/actionLog.types"
import type {
  DispatchReplacementHistoryDto,
  StatementActionLogEntry,
  StatementBusLine,
} from "@/types/releasePlanTypes"
import type { StatementStatus } from "@/types/statement.types"

export type DayType = "workday" | "saturday" | "sunday" | "holiday"

export type WorkflowStatus = StatementStatus | "Unknown"

export interface StatementRow {
  routeId: string
  routeNumber: string
  dispatchBusLineId: string
  statementId: string | null
  busLineNumber: string
  exitTime: string | null
  endTime: string | null
  status: WorkflowStatus
  planRevolutions: number | null
  factRevolutions: number | null
  spokenRevolutions: number | null
  // ✅ Добавляем новые поля под API ActionLog
  driverId?: string | null
  busId?: string | null

  busGarageNumber: string | null
  busGovNumber: string | null
  driverName: string | null
  driverServiceNumber: string | null
  description: string | null
  raw: StatementBusLine
}

export interface RouteBucket {
  id: string
  number: string
  rows: StatementRow[]
}

export type StatusModalMode = "gotOff" | "order" | "complete" | "remove"

export interface StatusModalResult {
  status: StatementStatus
  revolutionCount: number | null
  reason?: ActionLogStatus | null
  comment?: string | null
  orderDescription?: string | null
}

export interface ReplaceModalState {
  open: boolean
  row: StatementRow | null
}

export interface StatusModalState {
  open: boolean
  mode: StatusModalMode
  row: StatementRow | null
}

export interface EventLogModalState {
  open: boolean
  row: StatementRow | null
}

export type DispatchHistory = DispatchReplacementHistoryDto[]
export type EventLogTimelineEntry = {
  id: string
  time: string
  description: string
  type: "history" | "log"
}

export type StatementActionLog = StatementActionLogEntry