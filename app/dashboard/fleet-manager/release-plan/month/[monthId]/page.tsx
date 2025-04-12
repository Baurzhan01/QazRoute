"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, BriefcaseBusiness, Sparkles } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateCalendarMonth } from "../../mock/calendarMock"
import { getMonthName } from "../../utils/dateUtils"

export default function MonthDetailPage() {
  const params = useParams()
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

  if (loading || !calendarMonth) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard/fleet-manager/release-plan">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">Загрузка...</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  const monthName = getMonthName(new Date(year, month, 1))

  // Создаем URL для каждого типа дня
  const workdaysUrl = `/dashboard/fleet-manager/release-plan/daytype/workday/${year}-${month + 1}`
  const saturdaysUrl = `/dashboard/fleet-manager/release-plan/daytype/saturday/${year}-${month + 1}`
  const sundaysUrl = `/dashboard/fleet-manager/release-plan/daytype/sunday/${year}-${month + 1}`
  const holidaysUrl = `/dashboard/fleet-manager/release-plan/daytype/holiday/${year}-${month + 1}`

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
        {/* Карточка для будних дней */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href={workdaysUrl}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-md">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-5 w-5" />
                  <span>Будни (ПН-ПТ)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-blue-600">{calendarMonth.workdays.length}</h2>
                  <p className="text-sm text-gray-500 mt-2">рабочих дней в месяце</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Карточка для суббот */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href={saturdaysUrl}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-md">
              <CardHeader className="bg-amber-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Суббота</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-amber-600">{calendarMonth.saturdays.length}</h2>
                  <p className="text-sm text-gray-500 mt-2">суббот в месяце</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Карточка для воскресений */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href={sundaysUrl}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-md">
              <CardHeader className="bg-green-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Воскресенье</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-600">{calendarMonth.sundays.length}</h2>
                  <p className="text-sm text-gray-500 mt-2">воскресений в месяце</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Карточка для праздников */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href={holidaysUrl}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-md">
              <CardHeader className="bg-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Праздничные дни</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-purple-600">{calendarMonth.holidays.length}</h2>
                  <p className="text-sm text-gray-500 mt-2">праздничных дней в месяце</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

