"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import FinalDispatchExport from "./components/FinalDispatchExport"
import FinalDispatchTable from "../../../../components/FinalDispatchTable"
import { useFinalDispatch } from "../../../../hooks/useFinalDispatch"
import { formatDateLabel, formatDayOfWeek, parseDate } from "../../../../utils/dateUtils"
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

export default function FinalDispatchPage() {
  const params = useParams()
  const router = useRouter()

  const dateParam = params?.date as string | undefined
  const rawDayType = params?.dayType as string | undefined
  const dayType = normalizeDayType(rawDayType)

  const [hydrated, setHydrated] = useState(false)
  const [displayDate, setDisplayDate] = useState<Date | null>(null)
  const { refetch } = useFinalDispatch(displayDate, dayType)

  useEffect(() => {
    if (hydrated && displayDate && dayType) {
      refetch()
    }
  }, [hydrated, displayDate, dayType, refetch])

  useEffect(() => {
    if (dateParam) {
      const parsed = parseDate(dateParam)
      setDisplayDate(parsed)
    }
    setHydrated(true)
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

  const depotName = convoyNumber ? `Автоколонна №${convoyNumber}` : "—"

  const handleGoBack = () => {
    router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateParam}`)
  }

  if (!hydrated || !displayDate) {
    return <div className="p-6 text-gray-500">⏳ Загрузка страницы...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 bg-white border-b py-4 px-6 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            План выпуска автобусов {depotName && `· ${depotName}`}
          </h2>
          <p className="text-gray-600 font-medium">
            {formatDayOfWeek(displayDate)}, {formatDateLabel(displayDate)}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                `/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateParam}/final-dispatch/print`,
                "_blank"
              )
            }
          >
            📄 Файл для печати
          </Button>
          {finalDispatch && (
            <FinalDispatchExport
              date={displayDate}
              data={finalDispatch}
              depotName={depotName}
            />
          )}
          <Button variant="secondary" onClick={handleGoBack}>
            ← Назад к маршрутам
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 shadow rounded-lg">
        {loading && <p className="text-gray-500">Загрузка данных...</p>}
        {error && <p className="text-red-500">Ошибка: {error}</p>}
        {!loading && !error && finalDispatch && (
          <FinalDispatchTable
            data={finalDispatch}
            depotNumber={convoyNumber}
            driversCount={driversCount}
            busesCount={busesCount}
            convoySummary={convoySummary}
            dayType={dayType ?? "workday"}
          />
        )}
      </div>
    </div>
  )
}
