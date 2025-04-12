"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Calendar, ChevronRight } from "lucide-react"
import type { CalendarMonth } from "../types/plan"
import { getMonthName } from "../utils/dateUtils"
import Link from "next/link"

interface MonthSelectorProps {
  currentMonth: CalendarMonth | null
  nextMonth: CalendarMonth | null
  onNext: () => void
  loading: boolean
}

export default function MonthSelector({ currentMonth, nextMonth, onNext, loading }: MonthSelectorProps) {
  if (loading || !currentMonth || !nextMonth) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    )
  }

  const formatMonth = (month: CalendarMonth): string => {
    return `${getMonthName(new Date(month.year, month.month, 1))} ${month.year}`
  }

  // Создаем URL для страницы месяца
  const currentMonthUrl = `/dashboard/fleet-manager/release-plan/month/${currentMonth.year}-${currentMonth.month + 1}`
  const nextMonthUrl = `/dashboard/fleet-manager/release-plan/month/${nextMonth.year}-${nextMonth.month + 1}`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link href={currentMonthUrl}>
          <Card className="h-full cursor-pointer transition-all hover:shadow-md">
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Текущий месяц</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-blue-600 capitalize">{formatMonth(currentMonth)}</h2>
                <p className="text-sm text-gray-500 mt-2">
                  {currentMonth.workdays.length} рабочих, {currentMonth.saturdays.length} суббот,{" "}
                  {currentMonth.sundays.length} воскресений, {currentMonth.holidays.length} праздников
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link href={nextMonthUrl}>
          <Card className="h-full cursor-pointer transition-all hover:shadow-md">
            <CardHeader className="bg-green-500 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Следующий месяц</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white text-green-600 hover:bg-green-50"
                  onClick={(e) => {
                    e.preventDefault() // Предотвращаем переход по ссылке
                    onNext()
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-600 capitalize">{formatMonth(nextMonth)}</h2>
                <p className="text-sm text-gray-500 mt-2">
                  {nextMonth.workdays.length} рабочих, {nextMonth.saturdays.length} суббот, {nextMonth.sundays.length}{" "}
                  воскресений, {nextMonth.holidays.length} праздников
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  )
}

