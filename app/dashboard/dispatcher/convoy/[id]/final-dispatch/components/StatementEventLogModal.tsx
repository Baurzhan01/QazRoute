"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Clock, Repeat, ClipboardList, Info, Activity } from "lucide-react"

import { actionLogService } from "@/service/actionLogService"
import { releasePlanService } from "@/service/releasePlanService"
import type { EventLogModalState, EventLogTimelineEntry } from "../types"
import { classNames, prettifyStatus, prettifyStatementStatus } from "../utils/helpers"

interface StatementEventLogModalProps {
  state: EventLogModalState
  onClose: () => void
}

const StatementEventLogModal = ({ state, onClose }: StatementEventLogModalProps) => {
  const { open, row } = state
  const [history, setHistory] = useState<EventLogTimelineEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !row) return

    setLoading(true)
    Promise.all([
      releasePlanService.getDispatchHistory(row.dispatchBusLineId),
      actionLogService.getByDispatchBusLineId(row.dispatchBusLineId),
    ])
      .then(([historyRes, logsRes]) => {
        const items: EventLogTimelineEntry[] = []

        // История замен
        for (const item of historyRes.value ?? []) {
          const date = item.replacedAt ? new Date(item.replacedAt) : null
          const time = date
            ? date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
            : "-"
          items.push({
            id: `history-${item.replacedAt}-${item.type}`,
            time,
            description: `🔁 Замена: ${item.type} ${
              item.newDriverName ?? item.newBusNumber ?? ""
            }`.trim(),
            type: "history",
          })
        }

        // ActionLog события
        for (const log of logsRes.value ?? []) {
          const hour = log.time?.hour ?? 0
          const minute = log.time?.minute ?? 0
          const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`

          const parts: string[] = []
          if (log.actionStatus) parts.push(prettifyStatus(log.actionStatus))
          if (log.statementStatus)
            parts.push(`(${prettifyStatementStatus(log.statementStatus)})`)

          const headline = parts.length ? `⚙️ ${parts.join(" ")}` : "⚙️ Системное событие"
          const subdetails = []

          if (log.revolutionCount != null) subdetails.push(`Оборотов: ${log.revolutionCount}`)
          if (log.description) subdetails.push(log.description)

          const description = [headline, ...subdetails].join("\n")

          items.push({
            id: log.id,
            time,
            description,
            type: "log",
          })
        }

        // Сортировка по времени
        items.sort((a, b) => a.time.localeCompare(b.time))
        setHistory(items)
      })
      .catch(err => {
        console.error("Failed to load logs:", err)
        setHistory([])
      })
      .finally(() => setLoading(false))
  }, [open, row])

  const iconForType = useMemo(
    () => ({
      log: <Activity className="w-4 h-4 text-blue-500" />,
      history: <Repeat className="w-4 h-4 text-emerald-600" />,
    }),
    []
  )

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-gradient-to-b from-slate-50 to-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-sky-600" />
            Журнал событий
          </DialogTitle>
          {row && (
            <DialogDescription className="text-slate-600">
              Маршрут <b>№{row.routeNumber}</b>, выход <b>{row.busLineNumber}</b>
              {row.driverName && ` · Водитель: ${row.driverName}`}
              {row.busGarageNumber &&
                ` · Автобус: ${row.busGarageNumber}/${row.busGovNumber}`}
            </DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-sky-500 border-t-transparent mb-4"></div>
            <p>Загрузка журнала событий...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-center leading-relaxed">
              Нет событий для данного выхода. <br />
              <span className="text-xs text-muted-foreground">
                История появится после изменений статуса.
              </span>
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[420px] rounded-lg p-4 pr-6">
            <div className="relative pl-8 space-y-6">
              {/* Вертикальная линия таймлайна */}
              <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-slate-200" />

              {history.map((entry, index) => (
                <div key={entry.id} className="relative group">
                  {/* Метка времени */}
                  <div className="absolute -left-[30px] flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-300 shadow-sm group-hover:border-sky-400 transition">
                    {iconForType[entry.type]}
                  </div>

                  <div className="ml-2 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-snug">
                        {entry.description}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Clock className="w-3 h-3" />
                        {entry.time}
                      </div>
                    </div>

                    <Separator className="my-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={classNames(
                          "inline-flex items-center px-2 py-1 rounded-full font-medium",
                          entry.type === "log"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-emerald-50 text-emerald-700"
                        )}
                      >
                        {entry.type === "log" ? "Системное событие" : "История замен"}
                      </span>
                      <span className="text-slate-400 text-[11px] italic">
                        {index + 1} из {history.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            {history.length > 0 && (
              <span>
                Всего событий: <b>{history.length}</b> —{" "}
                <span className="text-blue-600">
                  {history.filter(e => e.type === "log").length}
                </span>{" "}
                системных,{" "}
                <span className="text-emerald-600">
                  {history.filter(e => e.type === "history").length}
                </span>{" "}
                замен.
              </span>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default StatementEventLogModal
