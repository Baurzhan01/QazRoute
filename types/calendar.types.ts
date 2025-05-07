import type { DayType } from "./common.types"

export interface CalendarDay {
  date: string
  dayType: DayType
  isToday: boolean
  isHoliday: boolean
  holidayName?: string
}

export interface CalendarMonth {
  year: number
  month: number
  days: CalendarDay[]
  workdays: CalendarDay[]
  saturdays: CalendarDay[]
  sundays: CalendarDay[]
  holidays: CalendarDay[]
}
