"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useFinalDispatch } from "../../../../../hooks/useFinalDispatch"
import FinalDispatchTable from "@/app/dashboard/fleet-manager/release-plan/components/FinalDispatchTable"
import { parseDate } from "../../../../../utils/dateUtils"
import type { ValidDayType } from "@/types/releasePlanTypes"

function normalizeDayType(value?: string): ValidDayType | undefined {
  const map: Record<string, ValidDayType> = {
    workday: "workday",
    workdays: "workday",
    saturday: "saturday",
    sunday: "sunday",
    holiday: "holiday",
  }
  return value ? map[value.toLowerCase()] : undefined
}

export default function FinalDispatchPrintPage() {
  const params = useSearchParams()
  const dateParam = params.get("date") || ""
  const rawDayType = params.get("dayType") || "workday"
  const dayType = normalizeDayType(rawDayType)

  const [displayDate, setDisplayDate] = useState<Date | null>(null)

  useEffect(() => {
    if (dateParam) {
      const parsed = parseDate(dateParam)
      setDisplayDate(parsed)
    }
  }, [dateParam])

  const {
    finalDispatch,
    convoySummary,
    driversCount,
    busesCount,
    convoyNumber,
    loading,
    error,
  } = useFinalDispatch(displayDate, dayType)

  if (!displayDate) {
    return <div className="p-6 text-gray-500">⏳ Подготовка данных...</div>
  }

  if (loading) {
    return <div className="p-6 text-gray-500">📦 Загрузка...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">❌ Ошибка загрузки: {error}</div>
  }

  if (!finalDispatch) {
    return <div className="p-6 text-gray-500">❔ Нет данных для отображения</div>
  }

  return (
    <div className="p-4">
      <FinalDispatchTable
        data={finalDispatch}
        depotNumber={convoyNumber}
        driversCount={driversCount}
        busesCount={busesCount}
        convoySummary={convoySummary}
        dayType={dayType ?? "workday"}
      />
    </div>
  )
}
