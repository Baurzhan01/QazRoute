import { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

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

        for (const item of historyRes.value ?? []) {
          const date = item.replacedAt ? new Date(item.replacedAt) : null
          const time = date
            ? `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
            : "-"
          items.push({
            id: `history-${item.replacedAt}-${item.type}`,
            time,
            description: `${item.type} - ${item.newDriverName ?? item.newBusNumber ?? ""}`.trim(),
            type: "history",
          })
        }

        for (const log of logsRes.value ?? []) {
          // Безопасное форматирование времени
          const hour = log.time?.hour ?? 0
          const minute = log.time?.minute ?? 0
          const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
          
          // Создаем структурированное описание события
          const descriptionParts = []
          
          // Добавляем статус действия как основной заголовок
          if (log.actionStatus) {
            descriptionParts.push(`🔸 ${prettifyStatus(log.actionStatus)}`)
          }
          
          // Добавляем детали в структурированном виде
          const details = []
          
          if (log.statementStatus) {
            details.push(`Статус: ${prettifyStatementStatus(log.statementStatus)}`)
          }
          
          if (log.revolutionCount != null) {
            details.push(`Оборотов: ${log.revolutionCount}`)
          }
          
          if (log.description) {
            details.push(log.description)
          }
          
          // Объединяем основное описание и детали
          let description = descriptionParts.join("")
          if (details.length > 0) {
            description += "\n" + details.join(" • ")
          }
          
          if (!description.trim()) {
            description = "Системное событие"
          }
          
          items.push({
            id: log.id,
            time,
            description,
            type: "log",
          })
        }

        items.sort((a, b) => a.time.localeCompare(b.time))
        setHistory(items)
      })
      .catch(error => {
        console.error("log modal load error", error)
        setHistory([])
      })
      .finally(() => setLoading(false))
  }, [open, row])

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-slate-900">Журнал событий</DialogTitle>
          {row && (
            <DialogDescription className="text-slate-600">
              Маршрут №{row.routeNumber}, выход {row.busLineNumber}
              {row.driverName && ` · Водитель: ${row.driverName}`}
              {row.busGarageNumber && ` · Автобус: ${row.busGarageNumber}/${row.busGovNumber}`}
            </DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-muted-foreground">Загрузка журнала событий...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-muted-foreground text-center">
              Записей пока нет.<br />
              <span className="text-xs">События появятся здесь при изменении статуса выхода</span>
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96 rounded-lg border bg-slate-50/50 p-6">
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={entry.id} className="relative">
                  {/* Timeline line */}
                  {index < history.length - 1 && (
                    <div className="absolute left-6 top-8 w-px h-8 bg-slate-200" />
                  )}
                  
                  <div className="flex items-start gap-6 p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    {/* Time indicator */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <div className={classNames(
                        "w-4 h-4 rounded-full border-2 border-white shadow-sm",
                        entry.type === "log" ? "bg-blue-500" : "bg-emerald-500"
                      )} />
                      <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        {entry.time}
                      </div>
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className={classNames(
                        "text-sm font-medium mb-2 whitespace-pre-line",
                        entry.type === "log" ? "text-slate-900" : "text-emerald-900"
                      )}>
                        {entry.description}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={classNames(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          entry.type === "log" 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-emerald-100 text-emerald-700"
                        )}>
                          {entry.type === "log" ? "Системное событие" : "История замен"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {history.length > 0 && (
              <span>
                Всего событий: {history.length} 
                {history.filter(e => e.type === "log").length > 0 && 
                  ` (системных: ${history.filter(e => e.type === "log").length})`}
                {history.filter(e => e.type === "history").length > 0 && 
                  ` (замен: ${history.filter(e => e.type === "history").length})`}
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
