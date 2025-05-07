"use client"

import { useState, useEffect } from "react"
import type { CalendarMonth } from "../types/plan"
import { generateCalendarMonth } from "../utils/generateCalendar"

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState<CalendarMonth | null>(null)
  const [nextMonth, setNextMonth] = useState<CalendarMonth | null>(null)
  const [loading, setLoading] = useState(true)

  // Генерация начального месяца и следующего
  useEffect(() => {
    setLoading(true)

    const now = new Date()
    const current = generateCalendarMonth(now.getFullYear(), now.getMonth())
    const next = generateCalendarMonth(
      now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(),
      now.getMonth() === 11 ? 0 : now.getMonth() + 1
    )

    setCurrentMonth(current)
    setNextMonth(next)
    setLoading(false)
  }, [])

  // Перемотка месяца вперёд
  const goToNextMonth = () => {
    if (!currentMonth || !nextMonth) return
    setLoading(true)

    const newCurrent = nextMonth
    const newNext = generateCalendarMonth(
      nextMonth.month === 11 ? nextMonth.year + 1 : nextMonth.year,
      nextMonth.month === 11 ? 0 : nextMonth.month + 1
    )

    setCurrentMonth(newCurrent)
    setNextMonth(newNext)
    setLoading(false)
  }

  return {
    currentMonth,
    nextMonth,
    loading,
    goToNextMonth,
  }
}
