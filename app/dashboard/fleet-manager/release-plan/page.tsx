"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import MonthSelector from "./components/MonthSelector"
import { useCalendar } from "./hooks/useCalendar"
import { releasePlanService } from "@/service/releasePlanService"
import { toast } from "@/components/ui/use-toast"

export default function ReleasePlanPage() {
  const { currentMonth, nextMonth, loading: calendarLoading, goToNextMonth } = useCalendar()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const formattedDate = selectedDate.toISOString().split("T")[0]

  const {
    data: dispatchPlan,
    isLoading: dispatchLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["releasePlan", formattedDate],
    queryFn: async () => {
      const response = await releasePlanService.getFullDispatchByDate(formattedDate)
      if (!response.isSuccess || !response.value) {
        throw new Error(response.error || "Ошибка загрузки плана выпуска")
      }
      return response.value
    },
    enabled: !!formattedDate,
  })

  useEffect(() => {
    if (!calendarLoading && currentMonth) {
      setIsInitialLoad(false)
    }
  }, [calendarLoading, currentMonth])

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/fleet-manager">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700"
          >
            План выпуска
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 mt-1"
          >
            Планирование и управление ежедневными маршрутами
          </motion.p>
        </div>
      </div>

      <MonthSelector
        currentMonth={currentMonth}
        nextMonth={nextMonth}
        onNext={goToNextMonth}
        loading={calendarLoading}
      />

      {/* Лоадер при первой загрузке */}
      {isInitialLoad || dispatchLoading || isFetching ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          {/* Здесь ты можешь подключить отображение по дням и резерву */}
          {/* Например, <DayPlanView data={dispatchPlan} /> */}
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {/* {JSON.stringify(dispatchPlan, null, 2)} */}
          </pre>
        </>
      )}
    </div>
  )
}
