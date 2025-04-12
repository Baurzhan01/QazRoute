"use client"

import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Calendar, BriefcaseBusiness, Sparkles } from "lucide-react"
import type { CalendarDay, CalendarMonth } from "../types/plan"
import { formatDateLabel, formatDayOfWeek } from "../utils/dateUtils"

interface CalendarDaysCardProps {
  month: CalendarMonth
  title: string
  days: CalendarDay[]
  icon: React.ReactNode
  bgColor: string
  textColor: string
  delay?: number
}

export function CalendarDaysCard({ month, title, days, icon, bgColor, textColor, delay = 0 }: CalendarDaysCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <Card className="h-full">
        <CardHeader className={`${bgColor} text-white`}>
          <CardTitle className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {days.map((day) => (
              <PlanDayCard key={day.date.toISOString()} day={day} />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface PlanDayCardProps {
  day: CalendarDay
}

function PlanDayCard({ day }: PlanDayCardProps) {
  const formattedDate = formatDateLabel(day.date)
  const dayOfWeek = formatDayOfWeek(day.date)
  const formattedDay = `${day.date.getDate()} ${day.date.toLocaleString("ru-RU", { month: "long" })}`

  // URL для страницы дня в формате YYYY-MM-DD
  const dateParam = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`
  const dayTypeParam = day.dayType

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`p-2 rounded-lg border ${day.isToday ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"} cursor-pointer transition-all`}
    >
      <Link href={`/dashboard/fleet-manager/release-plan/${dayTypeParam}/${dateParam}`}>
        <div className="text-center">
          <div className="text-lg font-bold">{dayOfWeek}</div>
          <div className="text-sm">{formattedDay}</div>
          {day.isHoliday && (
            <div className="flex items-center justify-center mt-1 text-amber-500">
              <Sparkles className="h-3 w-3 mr-1" />
              <span className="text-xs">Праздник</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

interface MonthCalendarProps {
  currentMonth: CalendarMonth
}

export default function MonthCalendar({ currentMonth }: MonthCalendarProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {currentMonth.workdays.length > 0 && (
        <CalendarDaysCard
          month={currentMonth}
          title="Будни (ПН-ПТ)"
          days={currentMonth.workdays}
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          bgColor="bg-blue-600"
          textColor="text-blue-600"
          delay={0.1}
        />
      )}

      {currentMonth.saturdays.length > 0 && (
        <CalendarDaysCard
          month={currentMonth}
          title="Суббота"
          days={currentMonth.saturdays}
          icon={<Calendar className="h-5 w-5" />}
          bgColor="bg-amber-600"
          textColor="text-amber-600"
          delay={0.2}
        />
      )}

      {currentMonth.sundays.length > 0 && (
        <CalendarDaysCard
          month={currentMonth}
          title="Воскресенье"
          days={currentMonth.sundays}
          icon={<Calendar className="h-5 w-5" />}
          bgColor="bg-green-600"
          textColor="text-green-600"
          delay={0.3}
        />
      )}

      {currentMonth.holidays.length > 0 && (
        <CalendarDaysCard
          month={currentMonth}
          title="Праздничные дни"
          days={currentMonth.holidays}
          icon={<Sparkles className="h-5 w-5" />}
          bgColor="bg-purple-600"
          textColor="text-purple-600"
          delay={0.4}
        />
      )}
    </div>
  )
}
