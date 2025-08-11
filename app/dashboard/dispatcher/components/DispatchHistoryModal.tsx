"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { releasePlanService } from "@/service/releasePlanService"
import type { DispatchReplacementHistoryDto } from "@/types/releasePlanTypes"

interface Props {
  open: boolean
  onClose: () => void
  dispatchId: string
  onSetInfo?: (payload: { dispatchId: string; text: string; exited: boolean; historyCount: number }) => void
  setHistoryLength: (count: number) => void
}

const stripHtml = (s?: string) => (s ? s.replace(/<[^>]+>/g, "").trim() : "")
const formatTime = (t?: string) => (t ? t.slice(0, 5) : "—")

export default function DispatchHistoryModal({
  open,
  onClose,
  dispatchId,
  onSetInfo,
  setHistoryLength,
}: Props) {
  const [history, setHistory] = useState<DispatchReplacementHistoryDto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const fetchHistory = async () => {
      setLoading(true)
      try {
        const res = await releasePlanService.getDispatchHistory(dispatchId)
        if (res.isSuccess && res.value) {
          setHistory(res.value)
          setHistoryLength(res.value.length)

          // если в последнем «ремонте» есть andTime — это выезд на линию: фиксируем это на сервере
          const latestRepair = res.value.find((h) => h.type === "REPAIR" && h.andTime)
          if (latestRepair) {
            const dateStr = latestRepair.startDate || new Date().toISOString().split("T")[0]

            await releasePlanService.updateBusLineDescription(
              dispatchId,
              dateStr,
              "Автобус выехал на линию"
            )

            onSetInfo?.({
              dispatchId,
              text: "Автобус выехал на линию",
              exited: true,
              historyCount: res.value.length,
            })
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке истории:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [open, dispatchId, onSetInfo, setHistoryLength])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Журнал событий</DialogTitle>
        </DialogHeader>

        {loading && <p>Загрузка...</p>}
        {!loading && history.length === 0 && (
          <p className="text-sm text-gray-500">История пуста</p>
        )}

        <div className="space-y-3 mt-2">
          {history.map((item, i) => {
            const cleanRepairText = stripHtml(item.repairText)
            const cleanOldDriver = stripHtml(item.oldDriverName)
            const cleanNewDriver = stripHtml(item.newDriverName)
            const cleanOldBus = stripHtml(item.oldBusNumber)
            const cleanNewBus = stripHtml(item.newBusNumber)

            return (
              <div key={i} className="text-sm border-b pb-2">
                {item.type === "REPAIR" ? (
                  <>
                    <div>🛠️ Ремонт</div>
                    <div>
                      Время заезда: <b>{formatTime(item.startTime)}</b>
                    </div>
                    {item.andTime && (
                      <div className="text-green-600">
                        Выезд на линию: <b>{formatTime(item.andTime)}</b>
                      </div>
                    )}
                    {item.startRepairTime && (
                      <div>
                        Начало ремонта: <b>{formatTime(item.startRepairTime)}</b>
                      </div>
                    )}
                    {item.endRepairTime && (
                      <div>
                        Окончание ремонта: <b>{formatTime(item.endRepairTime)}</b>
                      </div>
                    )}
                    {cleanRepairText && (
                      <div className="mt-1 italic">Причина: {cleanRepairText}</div>
                    )}
                  </>
                ) : (
                  <>
                    <div>🔁 Замена</div>
                    <div>
                      {cleanOldDriver} → {cleanNewDriver}
                    </div>
                    <div>
                      {cleanOldBus} → {cleanNewBus}
                    </div>
                    <div>Время: {new Date(item.replacedAt).toLocaleString("ru-RU")}</div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
