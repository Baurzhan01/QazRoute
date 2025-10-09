// app/types/statement.types.ts

export type StatementStatus =
  | "OnWork"
  | "GotOff"
  | "OnOrder"
  | "Completed"
  | "Rejected"

export interface StatementDate {
  year: number
  month: number
  day: number
  dayOfWeek: number
  dayOfYear: number
  dayNumber: number
}

export interface Statement {
  id: string
  dispatchBusLineId: string
  planRevolutions: number
  driversRevolutions: number
  factRevolutions: number
  route: string
  status: StatementStatus | string
  gatherings: number
  date: StatementDate
}

export interface UpdateStatementPayload {
  dispatchBusLineId: string
  planRevolutions?: number | null
  driversRevolutions?: number | null
  factRevolutions?: number | null
  route?: string | number | null
  status?: StatementStatus | string
  gatherings?: number | null
  description?: string | null
  actionStatus?: string | null
  spokenRevolutions?: number | null
}