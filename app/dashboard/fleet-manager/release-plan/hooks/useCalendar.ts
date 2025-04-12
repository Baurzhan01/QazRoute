"use client"

import { useState, useEffect } from "react"
import type { CalendarMonth } from "../types/plan"
import { getCurrentMonth, getNextMonth } from "../mock/calendarMock"

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState<CalendarMonth | null>(null)
  const [nextMonth, setNextMonth] = useState<CalendarMonth | null>(null)
  const [loading, setLoading] = useState(true)

  // Инициализация календаря
  useEffect(() => {
    setLoading(true)

    // Имитация загрузки данных
    setTimeout(() => {
      setCurrentMonth(getCurrentMonth())
      setNextMonth(getNextMonth())
      setLoading(false)
    }, 500)
  }, [])

  // Функция для изменения месяца (перемотка вперед)
  const goToNextMonth = () => {
    if (!currentMonth || !nextMonth) return

    setLoading(true)

    // Имитация загрузки данных
    setTimeout(() => {
      // Текущий месяц становится предыдущим
      setCurrentMonth(nextMonth)

      // Вычисляем следующий месяц после текущего следующего
      let newNextMonth
      if (nextMonth.month === 11) {
        newNextMonth = {
          ...nextMonth,
          year: nextMonth.year + 1,
          month: 0,
        }
      } else {
        newNextMonth = {
          ...nextMonth,
          month: nextMonth.month + 1,
        }
      }

      // Вызываем функцию для генерации данных календаря
      const newNextMonthData = {
        ...newNextMonth,
        days: [], // Здесь будет генерация дней
        workdays: [],
        saturdays: [],
        sundays: [],
        holidays: [],
      }

      setNextMonth(newNextMonthData)
      setLoading(false)
    }, 500)
  }

  return {
    currentMonth,
    nextMonth,
    loading,
    goToNextMonth,
  }
}

