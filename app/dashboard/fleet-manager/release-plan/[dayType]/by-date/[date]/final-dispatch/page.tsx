// FinalDispatchPage.tsx — оптимизированная версия с ленивой отрисовкой и popover-редактором

"use client"

import dynamic from "next/dynamic"
import { Suspense, lazy, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { getAuthData } from "@/lib/auth-utils"
import { formatDateLabel, formatDayOfWeek, parseDate } from "../../../../utils/dateUtils"
import { telegramService } from "@/service/telegramService"
import { useFinalDispatch } from "../../../../hooks/useFinalDispatch"
import FinalDispatchExport from "./components/FinalDispatchExport"
import SkeletonBlock from "../../../../components/SkeletonBlock"
import { mapToReserveAssignmentUI } from "../../../../utils/releasePlanUtils"

const LazyFinalDispatchTable = dynamic(() => import("../../../../components/FinalDispatchTable"), {
  ssr: false,
  loading: () => <SkeletonBlock height={500} />,
})
const LazyReserveSection = lazy(() => import("../../../../components/ReserveRowSection"))
const LazyBottomBlocks = lazy(() => import("../../../../components/BottomBlocks"))

function normalizeDayType(value?: string) {
  const map = {
    workday: "workday",
    workdays: "workday",
    saturday: "saturday",
    sunday: "sunday",
    holiday: "holiday",
  } as const
  return value ? map[value.toLowerCase() as keyof typeof map] : undefined
}

export default function FinalDispatchPage() {
  const params = useParams()
  const router = useRouter()
  const dateParam = params?.date as string | undefined
  const dayType = normalizeDayType(params?.dayType as string)

  const [hydrated, setHydrated] = useState(false)
  const [displayDate, setDisplayDate] = useState<Date | null>(null)
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [readOnlyExportMode, setReadOnlyExportMode] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const authData = getAuthData()
  const convoyId = authData?.convoyId

  const {
    finalDispatch,
    convoySummary,
    driversCount,
    busesCount,
    orderAssignments,
    convoyNumber,
    loading,
    error,
    refetch,
  } = useFinalDispatch(displayDate, dayType)

  useEffect(() => {
    if (dateParam) setDisplayDate(parseDate(dateParam))
    setHydrated(true)
  }, [dateParam])

  useEffect(() => {
    if (hydrated && displayDate && dayType) refetch()
  }, [hydrated, displayDate, dayType, refetch])

  const handleSaveAsImage = async () => {
    const node = document.getElementById("final-dispatch-capture")
    if (!node) return
    setReadOnlyExportMode(true)
    await new Promise((r) => setTimeout(r, 100))

    try {
      const htmlToImage = await import("html-to-image")
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
      toast({ title: "Ошибка", description: "Не удалось сохранить изображение", variant: "destructive" })
    } finally {
      setReadOnlyExportMode(false)
    }
  }

  const handleGoBack = () => {
    router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateParam}`)
  }

  if (!hydrated || !displayDate) return <div className="p-6 text-gray-500">⏳ Загрузка страницы...</div>

  const depotName = convoyNumber ? `Автоколонна №${convoyNumber}` : "—"

  const mappedReserves = finalDispatch?.reserveAssignments.map((r, i) =>
    mapToReserveAssignmentUI(r, i, "Reserved")
  )

  const mappedOrders = orderAssignments.map((r, i) =>
    mapToReserveAssignmentUI(r, i, "Order")
  )

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
                const response = await telegramService.sendDispatchToDrivers(
                  displayDate.toISOString().split("T")[0],
                  convoyId
                )

                // Просто показываем как есть:
                toast({ title: "Готово!", description: response })
              } catch (error: any) {
                toast({
                  title: "Ошибка",
                  description: error.message || "Ошибка при отправке Telegram-сообщений",
                  variant: "destructive",
                })
              } finally {
                setIsSending(false)
              }
            }}
            disabled={isSending}
          >
            {isSending ? "📨 Отправка..." : "📩 Разослать водителям"}
          </Button>
          <Button variant="outline" onClick={handleSaveAsImage}>📷 Файл на печать</Button>
          {finalDispatch && (
            <FinalDispatchExport
              date={displayDate}
              data={finalDispatch}
              depotName={depotName}
            />
          )}
          <Button variant="secondary" onClick={handleGoBack}>← Назад к маршрутам</Button>
        </div>
      </div>

      <div id="final-dispatch-capture" className="bg-white p-6 shadow rounded-lg print-export">
        {loading && <SkeletonBlock height={300} />}
        {error && <p className="text-red-500">Ошибка: {error}</p>}
        {!loading && !error && finalDispatch && (
          <Suspense fallback={<SkeletonBlock height={400} />}>
            <LazyFinalDispatchTable
              data={finalDispatch}
              depotNumber={convoyNumber}
              orderAssignments={orderAssignments}
              driversCount={driversCount}
              busesCount={busesCount}
              convoySummary={convoySummary}
              dayType={dayType ?? "workday"}
              readOnlyMode={readOnlyExportMode}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}