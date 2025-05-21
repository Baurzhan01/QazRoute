import type { WorkShiftType } from "@/types/coordinator.types"

export type ShiftType = "day" | "night" | "dayOff" | "skip" | "vacation"

export interface DispatcherShiftDay {
  date: string
  shift: ShiftType
}

export interface DispatcherShift {
  dispatcherId: string
  fullName: string
  shifts: DispatcherShiftDay[]
}

export interface MonthData {
  year: number
  month: number
  daysInMonth: number
}

export interface WorkShiftDay {
  date: string // ISO Date string
  shiftType: WorkShiftType
}

export interface UserWorkShift {
  userId: string
  fullName: string
  role: string
  days: WorkShiftDay[]
  day: number
  night: number
  dayOff: number
  skip: number
  vacation: number
}