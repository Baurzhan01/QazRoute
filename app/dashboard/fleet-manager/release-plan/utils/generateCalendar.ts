// utils/generateCalendar.ts

import type { CalendarMonth, CalendarDay } from "../types/plan"
import { holidays } from "../data/holidays"
import { getDayType, isToday, formatDate } from "../utils/dateUtils"

export function generateCalendarMonth(year: number, month: number): CalendarMonth {
  const days: CalendarDay[] = []
  const current = new Date(year, month, 1)

  while (current.getMonth() === month) {
    const date = new Date(current)
    const dateStr = formatDate(date)
    const dayType = getDayType(date, holidays.map(h => new Date(h.date)))

    days.push({
      date: dateStr,
      dayType,
      isToday: isToday(date),
      isHoliday: dayType === "holiday",
      holidayName: holidays.find(h => h.date === dateStr)?.name,
    })

    current.setDate(current.getDate() + 1)
  }

  return {
    year,
    month,
    days,
    workdays: days.filter((d) => d.dayType === "workday"),
    saturdays: days.filter((d) => d.dayType === "saturday"),
    sundays: days.filter((d) => d.dayType === "sunday"),
    holidays: days.filter((d) => d.dayType === "holiday"),
  }
}
