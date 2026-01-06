// utils/generateCalendar.ts

import type { CalendarMonth, CalendarDay } from "../types/plan"
import { getHolidaysForYear } from "../data/holidays"
import { getDayType, isToday, formatDate } from "../utils/dateUtils"

export function generateCalendarMonth(year: number, month: number): CalendarMonth {
  const days: CalendarDay[] = []
  const yearHolidays = getHolidaysForYear(year)
  const holidayDates = yearHolidays.map((holiday) => new Date(holiday.date))
  const current = new Date(year, month, 1)

  while (current.getMonth() === month) {
    const date = new Date(current)
    const dateStr = formatDate(date)
    const dayType = getDayType(date, holidayDates)

    days.push({
      date: dateStr,
      dayType,
      isToday: isToday(date),
      isHoliday: dayType === "holiday",
      holidayName: yearHolidays.find((holiday) => holiday.date === dateStr)?.name,
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
