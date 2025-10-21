"use client"

import { useEffect, useMemo, useState } from "react"
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
import { Clock, Repeat, ClipboardList, Search, Filter, Activity } from "lucide-react"

import { actionLogService } from "@/service/actionLogService"
import { releasePlanService } from "@/service/releasePlanService"
import type { EventLogModalState, EventLogTimelineEntry } from "../types"
import { classNames, prettifyStatus, prettifyStatementStatus } from "../utils/helpers"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

/** ---------- helpers: time ---------- */
function pad2(n: number) { return String(n).padStart(2, "0") }

/** Принимаем разные варианты времени и приводим к HH:mm:ss */
function normalizeTimeToHms(value: any): { h: number, m: number, s: number, hms: string } {
  // case: object with hour/minute/second (e.g., LocalTime from backend)
  if (value && typeof value === "object" && ("hour" in value || "minute" in value)) {
    const h = Number(value.hour ?? 0)
    const m = Number(value.minute ?? 0)
    const s = Number(value.second ?? value.seconds ?? 0)
    return { h, m, s, hms: `${pad2(h)}:${pad2(m)}:${pad2(s)}` }
  }
  // case: string "HH:mm" or "HH:mm:ss"
  if (typeof value === "string" && /^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    const [hh, mm, ss = "00"] = value.split(":")
    const h = Math.min(23, Math.max(0, Number(hh)))
    const m = Math.min(59, Math.max(0, Number(mm)))
    const s = Math.min(59, Math.max(0, Number(ss)))
    return { h, m, s, hms: `${pad2(h)}:${pad2(m)}:${pad2(s)}` }
  }
  // fallback: midnight
  return { h: 0, m: 0, s: 0, hms: "00:00:00" }
}

/** Минуты/секунды от полуночи — для надёжной сортировки */
function daySeconds(h: number, m: number, s: number) { return h * 3600 + m * 60 + s }

/** Дата → HH:mm:ss в локальном часовом поясе (Asia/Almaty у пользователя) */
function formatDateToHms(d?: Date | string | null) {
  if (!d) return { h: 0, m: 0, s: 0, hms: "00:00:00" }
  const date = typeof d === "string" ? new Date(d) : d
  if (isNaN(date.getTime())) return { h: 0, m: 0, s: 0, hms: "00:00:00" }
  const h = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()
  return { h, m, s, hms: `${pad2(h)}:${pad2(m)}:${pad2(s)}` }
}

/** Удалить HTML-теги и привести <br> к переносам строк */
function stripHtml(html?: string | null) {
  if (!html) return ""
  // заменяем <br> на переносы
  let text = html.replace(/<br\s*\/?>/gi, "\n")
  // удаляем все теги
  text = text.replace(/<[^>]*>/g, "")
  // заменяем неразрывные пробелы и прочие сущности по минимуму
  text = text.replace(/&nbsp;/gi, " ")
  // тримим и нормализуем множественные переносы
  return text
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .join("\n")
}

/** Локализация типа ремонта */
function prettifyRepairType(t?: string | null) {
  if (!t) return ""
  const map: Record<string, string> = {
    Unscheduled: "Внеплановый",
    Scheduled: "Плановый",
    Emergency: "Аварийный",
  }
  return map[t] || t
}

/** Локализация названия события истории */
function prettifyHistoryType(t?: string | null) {
  if (!t) return ""
  const map: Record<string, string> = {
    REPAIR: "Ремонт",
    REPLACEMENT: "Замена",
  }
  return map[t] || t
}

/** Небольшой relative time для красоты (на уровне минут) */
function relativeFromNow(h: number, m: number) {
  const now = new Date()
  const nowSec = daySeconds(now.getHours(), now.getMinutes(), now.getSeconds())
  const sec = daySeconds(h, m, 0)
  const diffMin = Math.round((nowSec - sec) / 60)
  if (!isFinite(diffMin)) return ""
  if (diffMin === 0) return "только что"
  if (diffMin > 0) return `${diffMin} мин назад`
  return `через ${Math.abs(diffMin)} мин`
}

/** Цвет бейджа по actionStatus */
function actionBadgeClass(action?: string) {
  if (!action) return "bg-slate-100 text-slate-700"
  const a = action.toLowerCase()
  if (a.includes("replace")) return "bg-amber-100 text-amber-700"
  if (a.includes("rearrang")) return "bg-sky-100 text-sky-700"
  if (a.includes("order")) return "bg-indigo-100 text-indigo-700"
  if (a.includes("family") || a.includes("sick") || a.includes("reason")) return "bg-rose-100 text-rose-700"
  if (a.includes("technical") || a.includes("police") || a.includes("gas")) return "bg-purple-100 text-purple-700"
  return "bg-slate-100 text-slate-700"
}

/** Цвет бейджа по statementStatus */
function statementBadgeClass(status?: string) {
  if (!status) return "bg-slate-100 text-slate-700"
  const s = status
  switch (s) {
    case "OnWork": return "bg-emerald-100 text-emerald-700"
    case "GotOff": return "bg-rose-100 text-rose-700"
    case "OnOrder": return "bg-indigo-100 text-indigo-700"
    case "Completed": return "bg-gray-100 text-gray-700"
    case "Rejected": return "bg-orange-100 text-orange-700"
    default: return "bg-slate-100 text-slate-700"
  }
}

interface StatementEventLogModalProps {
  state: EventLogModalState
  onClose: () => void
}

const StatementEventLogModal = ({ state, onClose }: StatementEventLogModalProps) => {
  const { open, row } = state
  const [history, setHistory] = useState<EventLogTimelineEntry[]>([])
  const [loading, setLoading] = useState(false)

  // UI state
  const [showSystem, setShowSystem] = useState(true)
  const [showHistory, setShowHistory] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!open || !row) return

    setLoading(true)
    Promise.all([
      releasePlanService.getDispatchHistory(row.dispatchBusLineId),
      actionLogService.getByDispatchBusLineId(row.dispatchBusLineId),
    ])
      .then(([historyRes, logsRes]) => {
        const items: EventLogTimelineEntry[] = []

        // История (замены/ремонты). API возвращает replacedAt ISO, а для ремонта — дополнительные поля
        for (const item of historyRes.value ?? []) {
          const baseTime = formatDateToHms(item.replacedAt ? new Date(item.replacedAt) : null)
          const typeRu = prettifyHistoryType(item.type)

          if (item.type === "REPAIR") {
            const startHms = normalizeTimeToHms(item.startTime ?? baseTime.hms)
            const startRepairHms = normalizeTimeToHms(item.startRepairTime ?? "00:00:00")
            const endRepairHms = normalizeTimeToHms(item.endRepairTime ?? "00:00:00")
            const repairKind = prettifyRepairType(item.repairType)
            const details = stripHtml(item.repairText)

            const lines: string[] = []
            lines.push(`🔧 ${typeRu}${repairKind ? ` (${repairKind})` : ""}`)
            if (details) lines.push(`Описание: ${details}`)

            items.push({
              id: `history-${item.replacedAt}-REPAIR-${item.startTime ?? ""}`,
              time: baseTime.hms,
              description: lines.join("\n"),
              type: "history",
              // @ts-ignore сортировка по базовому времени
              __sortSec: daySeconds(baseTime.h, baseTime.m, baseTime.s),
              __actionStatus: "Repair",
              __statementStatus: "OnWork",
              __h: baseTime.h, __m: baseTime.m,
            } as any)
          } else {
            const who = [item.newDriverName, item.newBusNumber].filter(Boolean).join(" · ")
            const action = typeRu ? `(${typeRu})` : ""
            items.push({
              id: `history-${item.replacedAt}-${item.type}`,
              time: baseTime.hms,
              description: `🔁 Замена ${action}${who ? ": " + who : ""}`,
              type: "history",
              // для сортировки
              // @ts-ignore расширение
              __sortSec: daySeconds(baseTime.h, baseTime.m, baseTime.s),
              __actionStatus: "Replacement",
              __statementStatus: "OnWork",
            } as any)
          }
        }

        // ActionLog (может приходить либо объект времени, либо строка)
        for (const log of logsRes.value ?? []) {
          const t = normalizeTimeToHms(log.time)
          const parts: string[] = []
          if (log.actionStatus) parts.push(prettifyStatus(log.actionStatus))
          if (log.statementStatus) parts.push(`(${prettifyStatementStatus(log.statementStatus)})`)

          const headline = parts.length ? `⚙️ ${parts.join(" ")}` : "⚙️ Системное событие"
          const subdetails: string[] = []
          if (log.revolutionCount != null) subdetails.push(`Оборотов: ${log.revolutionCount}`)
          if (log.description) subdetails.push(log.description)
          const description = [headline, ...subdetails].join("\n")

          items.push({
            id: log.id,
            time: t.hms,
            description,
            type: "log",
            // расширенные поля для рендеринга
            // @ts-ignore
            __sortSec: daySeconds(t.h, t.m, t.s),
            __actionStatus: log.actionStatus,
            __statementStatus: log.statementStatus,
            __h: t.h, __m: t.m
          } as any)
        }

        items.sort((a: any, b: any) => (a.__sortSec ?? 0) - (b.__sortSec ?? 0))
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

  const filtered = useMemo(() => {
    let arr = history
    if (!showSystem) arr = arr.filter(e => e.type !== "log")
    if (!showHistory) arr = arr.filter(e => e.type !== "history")
    const q = query.trim().toLowerCase()
    if (q) arr = arr.filter(e => e.description.toLowerCase().includes(q))
    return arr
  }, [history, showSystem, showHistory, query])

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-gradient-to-b from-slate-50 to-white border-slate-200">
        <DialogHeader className="sticky top-0 bg-gradient-to-b from-slate-50 to-white z-10 pb-3">
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

          {/* панель управления */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white border">
                <Filter className="w-4 h-4 text-slate-500" />
                <div className="flex items-center gap-2">
                  <Switch checked={showSystem} onCheckedChange={setShowSystem} />
                  <span className="text-sm">Системные</span>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Switch checked={showHistory} onCheckedChange={setShowHistory} />
                  <span className="text-sm">Замены</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Поиск по описанию…"
                className="h-8 w-[220px]"
              />
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-sky-500 border-t-transparent mb-4"></div>
            <p>Загрузка журнала событий...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-center leading-relaxed">
              Нет событий для выбранных фильтров. <br />
              <span className="text-xs text-muted-foreground">
                Попробуйте изменить фильтр или поиск.
              </span>
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[420px] rounded-lg p-4 pr-6">
            <div className="relative pl-8 space-y-6">
              {/* Вертикальная линия таймлайна */}
              <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-slate-200" />

              {filtered.map((entry: any, index) => (
                <div key={entry.id} className="relative group">
                  {/* Метка времени (иконка) */}
                  <div className="absolute -left-[30px] flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-300 shadow-sm group-hover:border-sky-400 transition">
                  {iconForType[entry.type as "log" | "history"] ?? (
                    <Activity className="w-4 h-4 text-gray-400" />
                  )}
                  </div>

                  <div className="ml-2 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Верхняя строка: описание + время */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-snug">
                        {entry.description}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                          <Clock className="w-3 h-3" />
                          {entry.time}
                        </div>
                        {/* относительное время — красиво «сколько минут назад» */}
                        {"__h" in entry && typeof entry.__h === "number" && (
                          <div className="text-[11px] text-slate-400">
                            {relativeFromNow(entry.__h, entry.__m)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Бейджи статусов */}
                    {(entry.__actionStatus || entry.__statementStatus) && (
                      <>
                        <Separator className="my-2" />
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {entry.__actionStatus && (
                            <Badge className={classNames("px-2", actionBadgeClass(String(entry.__actionStatus)))}>
                              {prettifyStatus(String(entry.__actionStatus))}
                            </Badge>
                          )}
                          {entry.__statementStatus && (
                            <Badge className={classNames("px-2", statementBadgeClass(String(entry.__statementStatus)))}>
                              {prettifyStatementStatus(String(entry.__statementStatus))}
                            </Badge>
                          )}
                          <span
                            className={classNames(
                              "ml-auto inline-flex items-center px-2 py-1 rounded-full font-medium",
                              entry.type === "log"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-50 text-emerald-700"
                            )}
                          >
                            {entry.type === "log" ? "Системное событие" : "История замен"}
                          </span>
                          <span className="text-slate-400 text-[11px] italic">
                            {index + 1} из {filtered.length}
                          </span>
                        </div>
                      </>
                    )}
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
