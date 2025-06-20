"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import FinalDispatchExport from "./components/FinalDispatchExport"
import FinalDispatchTable from "../../../../components/FinalDispatchTable"
import { useFinalDispatch } from "../../../../hooks/useFinalDispatch"
import { formatDateLabel, formatDayOfWeek, parseDate } from "../../../../utils/dateUtils"
import type { ValidDayType } from "@/types/releasePlanTypes"
import { telegramService } from "@/service/telegramService"
import { toast } from "@/components/ui/use-toast"
import { getAuthData } from "@/lib/auth-utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import * as htmlToImage from "html-to-image"

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
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [displayDate, setDisplayDate] = useState<Date | null>(null)
  const { refetch } = useFinalDispatch(displayDate, dayType)
  const authData = getAuthData()
  const convoyId = authData?.convoyId
  const [readOnlyExportMode, setReadOnlyExportMode] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (dateParam) {
      const parsed = parseDate(dateParam)
      setDisplayDate(parsed)
    }
    setHydrated(true)
  }, [dateParam])

  useEffect(() => {
    if (hydrated && displayDate && dayType) {
      refetch()
    }
  }, [hydrated, displayDate, dayType, refetch])

  const {
    finalDispatch,
    convoySummary,
    driversCount,
    busesCount,
    orderAssignments,
    convoyNumber,
    loading,
    error,
  } = useFinalDispatch(displayDate, dayType)

  const depotName = convoyNumber ? `Автоколонна №${convoyNumber}` : "—"

  const handleSaveAsImage = async () => {
    const node = document.getElementById("final-dispatch-capture")
    if (!node) return

    setReadOnlyExportMode(true)
    await new Promise((r) => setTimeout(r, 100)) // ждём ререндеринг

    try {
      const dataUrl = await htmlToImage.toPng(node, {
        cacheBust: true,
        width: node.scrollWidth * 2,
        height: node.scrollHeight * 2,
        style: {
          transform: "scale(2)",
          transformOrigin: "top left",
          background: "white",
        },
      })

      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `План_выпуска_${dateParam}.png`
      link.click()
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изображение",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setReadOnlyExportMode(false)
    }
  }

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
              setIsSending(true)
              try {
                const responseText = await telegramService.sendDispatchToDrivers(
                  displayDate.toISOString().split("T")[0],
                  convoyId
                )
                setModalMessage(responseText)
              } catch (error: any) {
                setModalMessage(error.message || "Ошибка при отправке Telegram-сообщений")
              } finally {
                setIsSending(false)
              }
            }}
            disabled={isSending}
          >
            {isSending ? "📨 Отправка..." : "📩 Разослать водителям"}
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

      <div id="final-dispatch-capture" className="bg-white p-6 shadow rounded-lg print-export">
        {loading && <p className="text-gray-500">Загрузка данных...</p>}
        {error && <p className="text-red-500">Ошибка: {error}</p>}
        {!loading && !error && finalDispatch && (
          <FinalDispatchTable
            data={finalDispatch}
            depotNumber={convoyNumber}
            orderAssignments={orderAssignments}
            driversCount={driversCount}
            busesCount={busesCount}
            convoySummary={convoySummary}
            dayType={dayType ?? "workday"}
            readOnlyMode={readOnlyExportMode}
          />
        )}
      </div>

      <Dialog open={!!modalMessage} onOpenChange={() => setModalMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📨 Telegram-рассылка</DialogTitle>
          </DialogHeader>
          <div className="text-base">{modalMessage}</div>
          <DialogFooter>
            <Button onClick={() => setModalMessage(null)}>ОК</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
