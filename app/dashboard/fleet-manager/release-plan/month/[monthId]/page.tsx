"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, BriefcaseBusiness, Sparkles } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { generateCalendarMonth } from "../../utils/generateCalendar"
import { getMonthName } from "../../utils/dateUtils"
import type { CalendarMonth } from "../../types/plan"

export default function MonthDetailPage() {
  const params = useParams()
  const monthId = params.monthId as string

  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Извлекаем год и месяц из URL параметра
  const [year, month] = useMemo(() => {
    const parts = monthId?.split("-") ?? []
    const parsedYear = Number.parseInt(parts[0])
    const parsedMonth = Number.parseInt(parts[1]) - 1
    return [parsedYear, parsedMonth]
  }, [monthId])

  // ✅ Генерация календаря
  useEffect(() => {
    if (!isNaN(year) && !isNaN(month)) {
      setLoading(true)
      const monthData = generateCalendarMonth(year, month)
      setCalendarMonth(monthData)
      setLoading(false)
    }
  }, [year, month])

  if (loading || !calendarMonth) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard/fleet-manager/release-plan">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">Загрузка...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const monthName = getMonthName(new Date(year, month, 1))

  const dayTypes = [
    {
      type: "workday",
      label: "Будни (ПН-ПТ)",
      color: "bg-blue-600",
      textColor: "text-blue-600",
      icon: <BriefcaseBusiness className="h-5 w-5" />,
      count: calendarMonth.workdays.length,
      path: `/dashboard/fleet-manager/release-plan/daytype/workday/${year}-${month + 1}`,
    },
    {
      type: "saturday",
      label: "Суббота",
      color: "bg-amber-600",
      textColor: "text-amber-600",
      icon: <Calendar className="h-5 w-5" />,
      count: calendarMonth.saturdays.length,
      path: `/dashboard/fleet-manager/release-plan/daytype/saturday/${year}-${month + 1}`,
    },
    {
      type: "sunday",
      label: "Воскресенье",
      color: "bg-green-600",
      textColor: "text-green-600",
      icon: <Calendar className="h-5 w-5" />,
      count: calendarMonth.sundays.length,
      path: `/dashboard/fleet-manager/release-plan/daytype/sunday/${year}-${month + 1}`,
    },
    {
      type: "holiday",
      label: "Праздничные дни",
      color: "bg-purple-600",
      textColor: "text-purple-600",
      icon: <Sparkles className="h-5 w-5" />,
      count: calendarMonth.holidays.length,
      path: `/dashboard/fleet-manager/release-plan/daytype/holiday/${year}-${month + 1}`,
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/fleet-manager/release-plan">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">
            {monthName} {year}
          </h1>
          <p className="text-gray-500 mt-1">Выберите тип дня для планирования маршрутов</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dayTypes.map((day) => (
          <motion.div
            key={day.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={day.path}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                <CardHeader className={`${day.color} text-white`}>
                  <CardTitle className="flex items-center gap-2">
                    {day.icon}
                    <span>{day.label}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-center">
                    <h2 className={`text-2xl font-bold ${day.textColor}`}>{day.count}</h2>
                    <p className="text-sm text-gray-500 mt-2">дней</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
