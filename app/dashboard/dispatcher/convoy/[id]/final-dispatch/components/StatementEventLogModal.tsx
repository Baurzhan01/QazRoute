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
import { classNames, prettifyStatus } from "../utils/helpers"

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
          const time = `${String(log.time.hour).padStart(2, "0")}:${String(log.time.minute).padStart(2, "0")}`
          items.push({
            id: log.id,
            time,
            description: `${prettifyStatus(log.status)} - ${log.description}`,
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{"\u0416\u0443\u0440\u043d\u0430\u043b \u0441\u043e\u0431\u044b\u0442\u0438\u0439"}</DialogTitle>
          {row && (
            <DialogDescription>{`\u041c\u0430\u0440\u0448\u0440\u0443\u0442 \u2116${row.routeNumber}, \u0432\u044b\u0445\u043e\u0434 ${row.busLineNumber}`}</DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <p className="text-muted-foreground">{"\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430..."}</p>
        ) : history.length === 0 ? (
          <p className="text-muted-foreground">{"\u0417\u0430\u043f\u0438\u0441\u0435\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442."}</p>
        ) : (
          <ScrollArea className="h-48 rounded-md border bg-muted/40 p-3">
            <ul className="space-y-2 text-sm">
              {history.map(entry => (
                <li key={entry.id} className="flex items-start gap-3">
                  <span className="mt-0.5 text-xs font-medium text-muted-foreground w-12">{entry.time}</span>
                  <span className={classNames(entry.type === "log" ? "text-slate-700" : "text-muted-foreground")}>
                    {entry.description}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{"\u0417\u0430\u043a\u0440\u044b\u0442\u044c"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default StatementEventLogModal
