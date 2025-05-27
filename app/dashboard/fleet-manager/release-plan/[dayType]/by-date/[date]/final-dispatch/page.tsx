"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import FinalDispatchExport from "./components/FinalDispatchExport"
import FinalDispatchTable from "../../../../components/FinalDispatchTable"
import { useFinalDispatch } from "../../../../hooks/useFinalDispatch"
import { formatDateLabel, formatDayOfWeek, parseDate } from "../../../../utils/dateUtils"
import type { ValidDayType } from "@/types/releasePlanTypes"
import html2canvas from "html2canvas"
import { telegramService } from "@/service/telegramService"
import { toast } from "@/components/ui/use-toast"
import { getAuthData } from "@/lib/auth-utils"

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
  const authData = getAuthData()
  const convoyId = authData?.convoyId
  const [readOnlyExportMode, setReadOnlyExportMode] = useState(false)

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

  const handleSaveAsImage = async () => {
    const captureEl = document.getElementById("final-dispatch-capture")
    if (!captureEl) return
  
    setReadOnlyExportMode(true) // 🔥 Включаем readOnly
  
    await new Promise((r) => setTimeout(r, 100)) // подождать отрисовку
  
    const canvas = await html2canvas(captureEl, {
      scrollY: -window.scrollY,
      useCORS: true,
      scale: 2,
    })
  
    setReadOnlyExportMode(false) // 🔥 Вернуть обратно
  
    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `План_выпуска_${dateParam}.png`
    link.click()
  }
  

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
              variant="default"
              onClick={async () => {
                if (!displayDate || !convoyId) return
                try {
                  const res = await telegramService.sendDispatchToDrivers(
                    displayDate.toISOString().split("T")[0],
                    convoyId
                  )
                  if (res.isSuccess) {
                    toast({ title: "✅ Разнарядка отправлена водителям" })
                  } else {
                    toast({ title: "❌ Ошибка", description: res.error || "Не удалось отправить сообщение" })
                  }
                } catch (error) {
                  toast({ title: "Ошибка", description: "Ошибка при отправке Telegram-сообщений" })
                }
              }}
            >
              📩 Разослать водителям
          </Button>
        <Button variant="outline" onClick={handleSaveAsImage}>
          📷 Файл на печать
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

      <div id="final-dispatch-capture" className="bg-white p-6 shadow rounded-lg">
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
            readOnlyMode={readOnlyExportMode}
          />
        )}
      </div>
    </div>
  )
}
