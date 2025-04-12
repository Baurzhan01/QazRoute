"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { generateCalendarMonth } from "../../../mock/calendarMock"
import { formatDateLabel, formatDayOfWeek } from "../../../utils/dateUtils"

export default function DayTypePage() {
  const params = useParams()
  const dayType = params.dayType as string
  const monthId = params.monthId as string

  // Парсим год и месяц из monthId (формат: YYYY-MM)
  const [year, month] = useMemo(() => {
    const parts = monthId.split("-")
    return [Number.parseInt(parts[0]), Number.parseInt(parts[1]) - 1] // Месяцы в JS начинаются с 0
  }, [monthId])

  const [calendarMonth, setCalendarMonth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Имитация загрузки данных
    setLoading(true)
    setTimeout(() => {
      const monthData = generateCalendarMonth(year, month)
      setCalendarMonth(monthData)
      setLoading(false)
    }, 500)
  }, [year, month])

  const getDayTypeTitle = () => {
    switch (dayType) {
      case "workday":
        return "Рабочие дни"
      case "saturday":
        return "Субботы"
      case "sunday":
        return "Воскресенья"
      case "holiday":
        return "Праздничные дни"
      default:
        return "Дни"
    }
  }

  const getDaysForType = () => {
    if (!calendarMonth) return []

    switch (dayType) {
      case "workday":
        return calendarMonth.workdays
      case "saturday":
        return calendarMonth.saturdays
      case "sunday":
        return calendarMonth.sundays
      case "holiday":
        return calendarMonth.holidays
      default:
        return []
    }
  }

  const days = getDaysForType()

  if (loading || !calendarMonth) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href={`/dashboard/fleet-manager/release-plan/month/${year}-${month + 1}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">Загрузка...</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/fleet-manager/release-plan/month/${year}-${month + 1}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">{getDayTypeTitle()}</h1>
          <p className="text-gray-500 mt-1">
            {new Date(year, month, 1).toLocaleString("ru-RU", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {days.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500">Нет дней данного типа в выбранном месяце</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {days.map((day, index) => {
            const formattedDate = formatDateLabel(day.date)
            const dayOfWeek = formatDayOfWeek(day.date)
            const formattedDay = `${day.date.getDate()} ${day.date.toLocaleString("ru-RU", { month: "long" })}`

            // URL для страницы дня в формате YYYY-MM-DD
            const dateParam = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`

            return (
              <motion.div
                key={day.date.toISOString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/${dateParam}`}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${day.isToday ? "bg-blue-50 border-blue-300" : ""}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold">{dayOfWeek}</div>
                      <div className="text-2xl font-bold mt-1">{day.date.getDate()}</div>
                      <div className="text-sm text-gray-500">{day.date.toLocaleString("ru-RU", { month: "long" })}</div>
                      {day.isHoliday && day.holidayName && (
                        <div className="mt-2 text-xs text-amber-600">{day.holidayName}</div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

