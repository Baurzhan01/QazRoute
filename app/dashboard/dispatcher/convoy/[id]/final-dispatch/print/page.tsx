"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

import { convoyService } from "@/service/convoyService"
import { releasePlanService } from "@/service/releasePlanService"

import { getDayTypeFromDate } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/dateUtils"
import type { DayType, RouteBucket, StatementActionLog, StatementRow } from "../types"
import { routeStatusMap, statusMeta } from "../utils/constants"
import {
  collectActionLogsFromBuckets,
  collectRemovedRows,
  formatActionLogBus,
  formatActionLogDriver,
  formatActionLogTime,
  prettifyStatus,
  formatTime,
  splitRoutes,
} from "../utils/helpers"

interface Totals {
  plan: number
  fact: number
  spoken: number
}

const sumRowTotals = (rows: StatementRow[]): Totals =>
  rows.reduce<Totals>(
    (acc, row) => ({
      plan: acc.plan + (row.planRevolutions ?? 0),
      fact: acc.fact + (row.factRevolutions ?? 0),
      spoken: acc.spoken + (row.spokenRevolutions ?? 0),
    }),
    { plan: 0, fact: 0, spoken: 0 }
  )

const StatementPrintPage = () => {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const convoyId = (params?.id as string) || ""
  const dateParam = searchParams.get("date")

  const targetDate = useMemo(() => {
    if (!dateParam) return new Date()
    const parsed = new Date(`${dateParam}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }, [dateParam])

  const dateStr = useMemo(() => format(targetDate, "yyyy-MM-dd"), [targetDate])
  const prettyDate = useMemo(
    () => format(targetDate, "d MMMM yyyy (EEEE)", { locale: ru }),
    [targetDate]
  )
  const dayType = useMemo<DayType>(() => getDayTypeFromDate(dateStr) as DayType, [dateStr])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [convoyLabel, setConvoyLabel] = useState<string>("")
  const [routes, setRoutes] = useState<RouteBucket[]>([])
  const [removedRows, setRemovedRows] = useState<StatementRow[]>([])
  const [orderLogs, setOrderLogs] = useState<StatementActionLog[]>([])
  const [removedLogs, setRemovedLogs] = useState<StatementActionLog[]>([])

  useEffect(() => {
    if (!convoyId) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [statementRes, summaryRes] = await Promise.all([
          releasePlanService.getFullStatementByDate(dateStr, convoyId, routeStatusMap[dayType]),
          convoyService.getConvoySummary(convoyId, dateStr).catch(() => null),
        ])

        const data = statementRes.value ?? null
        const buckets = splitRoutes(data?.routes ?? [])
        setRoutes(buckets)
        setRemovedRows(collectRemovedRows(buckets))
        setOrderLogs(collectActionLogsFromBuckets(buckets, "onOrder"))
        setRemovedLogs(collectActionLogsFromBuckets(buckets, "removed"))

        const summary = summaryRes?.value ?? summaryRes ?? {}
        const label = summary?.convoyNumber != null
          ? `Колонна №${summary.convoyNumber}`
          : summary?.convoyName || ""
        setConvoyLabel(label)
      } catch (err: any) {
        console.error("print statement error", err)
        const message = err?.message || "Не удалось загрузить ведомость"
        setError(message)
        toast({
          title: "Ошибка",
          description: message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [convoyId, dateStr, dayType])

  const overallTotals = useMemo(() => sumRowTotals(routes.flatMap(route => route.rows)), [routes])

  const handlePrint = () => window.print()
  const handleClose = () => router.back()

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Печатная версия ведомости</h1>
          <p className="text-sm text-muted-foreground">{prettyDate}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Закрыть
          </Button>
          <Button onClick={handlePrint}>Печать</Button>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 py-6">
        <section className="rounded-xl bg-white p-6 shadow-sm print:shadow-none">
          <header className="mb-6 text-center">
            <p className="text-sm text-slate-500">{convoyLabel || "Конвой"}</p>
            <h2 className="text-2xl font-bold text-slate-800">Ведомость от {prettyDate}</h2>
          </header>

          {loading && <p className="text-center text-muted-foreground">Загрузка...</p>}
          {error && !loading && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="flex flex-col gap-8">
              <section className="break-inside-avoid">
                <h3 className="mb-3 text-lg font-semibold text-slate-700">Итоги по ведомости</h3>
                <div className="grid grid-cols-1 gap-3 rounded-lg border bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase text-slate-500">План оборотов</p>
                    <p className="text-xl font-semibold">{overallTotals.plan}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Факт оборотов</p>
                    <p className="text-xl font-semibold">{overallTotals.fact}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Со слов</p>
                    <p className="text-xl font-semibold">{overallTotals.spoken}</p>
                  </div>
                </div>
              </section>

              {routes.map(route => {
                const totals = sumRowTotals(route.rows)
                const removedSummaries = route.rows.flatMap(row => {
                  const entries: StatementActionLog[] = row.raw.removed ?? []
                  return entries.map((entry, index) => ({
                    key: `${row.dispatchBusLineId}-removed-${index}`,
                    exitNumber: row.busLineNumber,
                    routeNumber: row.routeNumber,
                    time: formatActionLogTime(entry.time),
                    driver: formatActionLogDriver(entry.driver),
                    bus: formatActionLogBus(entry.bus),
                    comment: entry.description || row.description || "Без комментария",
                    replacementType: entry.replacementType || null,
                  }))
                })
                const orderSummaries = route.rows.flatMap(row => {
                  const entries: StatementActionLog[] = row.raw.onOrder ?? []
                  return entries.map((entry, index) => ({
                    key: `${row.dispatchBusLineId}-order-${index}`,
                    exitNumber: row.busLineNumber,
                    routeNumber: row.routeNumber,
                    time: formatActionLogTime(entry.time),
                    driver: formatActionLogDriver(entry.driver),
                    bus: formatActionLogBus(entry.bus),
                    comment: entry.description || row.description || "Без комментария",
                    replacementType: entry.replacementType || null,
                  }))
                })

                return (
                  <section key={route.id} className="break-inside-avoid">
                    <h3 className="mb-2 text-lg font-semibold text-slate-800">Маршрут №{route.number}</h3>
                    <table className="w-full table-fixed border border-slate-300 text-xs">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <th className="border border-slate-300 px-2 py-1">№</th>
                          <th className="border border-slate-300 px-2 py-1">Выход</th>
                          <th className="border border-slate-300 px-2 py-1">Гос. номер</th>
                          <th className="border border-slate-300 px-2 py-1">Гар. номер</th>
                          <th className="border border-slate-300 px-2 py-1">Таб. номер</th>
                          <th className="border border-slate-300 px-2 py-1">Водитель</th>
                          <th className="border border-slate-300 px-2 py-1">Выезд</th>
                          <th className="border border-slate-300 px-2 py-1">Возврат</th>
                          <th className="border border-slate-300 px-2 py-1">План</th>
                          <th className="border border-slate-300 px-2 py-1">Факт</th>
                          <th className="border border-slate-300 px-2 py-1">Со слов</th>
                          <th className="border border-slate-300 px-2 py-1">Статус</th>
                          <th className="border border-slate-300 px-2 py-1">Примечание</th>
                        </tr>
                      </thead>
                      <tbody>
                        {route.rows.map((row, index) => {
                          const meta = statusMeta[row.status] ?? statusMeta.Unknown
                          const rowBackground = meta.rowClass ?? (index % 2 === 0 ? "bg-white" : "bg-slate-50")

                          return (
                            <tr key={row.dispatchBusLineId} className={rowBackground}>
                              <td className="border border-slate-200 px-2 py-1 text-center">{index + 1}</td>
                              <td className="border border-slate-200 px-2 py-1 text-center">{row.busLineNumber}</td>
                              <td className="border border-slate-200 px-2 py-1 text-center">{row.busGovNumber || "-"}</td>
                              <td className="border border-slate-200 px-2 py-1 text-center">{row.busGarageNumber || "-"}</td>
                              <td className="border border-slate-200 px-2 py-1 text-center">{row.driverServiceNumber || "-"}</td>
                              <td className="border border-slate-200 px-2 py-1">{row.driverName || "-"}</td>
                              <td className="border border-slate-200 px-2 py-1 text-center">{formatTime(row.exitTime)}</td>
                              <td className="border border-slate-200 px-2 py-1 text-center">{formatTime(row.endTime)}</td>
                              <td className="border border-slate-200 px-2 py-1 text-center">{row.planRevolutions ?? "-"}</td>
                              <td className="border border-slate-200 px-2 py-1 text-center">{row.factRevolutions ?? "-"}</td>
                              <td className="border border-slate-200 px-2 py-1 text-center">{row.spokenRevolutions ?? "-"}</td>
                              <td className="border border-slate-200 px-2 py-1 text-center">
                                {statusMeta[row.status]?.label || row.status}
                              </td>
                              <td className="border border-slate-200 px-2 py-1">{row.description || row.raw.description || ""}</td>
                            </tr>
                          )
                        })}
                        <tr className="bg-slate-200 font-semibold text-slate-800">
                          <td className="border border-slate-300 px-2 py-1 text-right" colSpan={8}>
                            Итого по маршруту
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-center">{totals.plan}</td>
                          <td className="border border-slate-300 px-2 py-1 text-center">{totals.fact}</td>
                          <td className="border border-slate-300 px-2 py-1 text-center">{totals.spoken}</td>
                          <td className="border border-slate-300 px-2 py-1" colSpan={2}></td>
                        </tr>
                      </tbody>
                    </table>

                    {(orderSummaries.length > 0 || removedSummaries.length > 0) && (
                      <div className="mt-4 space-y-4">
                        {orderSummaries.length > 0 && (
                          <div className="border border-purple-200 bg-purple-50/60">
                            <header className="flex items-center justify-between border-b border-purple-200 bg-purple-100/60 px-3 py-2">
                              <h4 className="text-sm font-semibold text-purple-700">Отправлены на заказ</h4>
                              <span className="text-xs text-purple-600">Всего: {orderSummaries.length}</span>
                            </header>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="text-xs uppercase tracking-wide text-purple-600">
                                  <tr>
                                    <th className="border border-purple-200 px-2 py-1 text-center">Выход</th>
                                    <th className="border border-purple-200 px-2 py-1 text-center">Маршрут</th>
                                    <th className="border border-purple-200 px-2 py-1 text-center">Время</th>
                                    <th className="border border-purple-200 px-2 py-1">Водитель</th>
                                    <th className="border border-purple-200 px-2 py-1">Автобус</th>
                                    <th className="border border-purple-200 px-2 py-1">Комментарий</th>
                                    <th className="border border-purple-200 px-2 py-1 text-center">Тип</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderSummaries.map(summary => (
                                    <tr key={summary.key} className="odd:bg-white even:bg-purple-100/40">
                                      <td className="border border-purple-200 px-2 py-1 text-center">{summary.exitNumber}</td>
                                      <td className="border border-purple-200 px-2 py-1 text-center">№{summary.routeNumber}</td>
                                      <td className="border border-purple-200 px-2 py-1 text-center">{summary.time}</td>
                                      <td className="border border-purple-200 px-2 py-1">{summary.driver}</td>
                                      <td className="border border-purple-200 px-2 py-1">{summary.bus}</td>
                                      <td className="border border-purple-200 px-2 py-1">{summary.comment}</td>
                                      <td className="border border-purple-200 px-2 py-1 text-center">
                                        {summary.replacementType ? (
                                          <span className="rounded bg-white/70 px-2 py-0.5 text-xs uppercase tracking-wide text-purple-600">
                                            {summary.replacementType}
                                          </span>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {removedSummaries.length > 0 && (
                          <div className="border border-rose-200 bg-rose-50/60">
                            <header className="flex items-center justify-between border-b border-rose-200 bg-rose-100/70 px-3 py-2">
                              <h4 className="text-sm font-semibold text-rose-700">Снятые с выхода</h4>
                              <span className="text-xs text-rose-600">Всего: {removedSummaries.length}</span>
                            </header>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="text-xs uppercase tracking-wide text-rose-600">
                                  <tr>
                                    <th className="border border-rose-200 px-2 py-1 text-center">Выход</th>
                                    <th className="border border-rose-200 px-2 py-1 text-center">Маршрут</th>
                                    <th className="border border-rose-200 px-2 py-1 text-center">Время</th>
                                    <th className="border border-rose-200 px-2 py-1">Водитель</th>
                                    <th className="border border-rose-200 px-2 py-1">Автобус</th>
                                    <th className="border border-rose-200 px-2 py-1">Комментарий</th>
                                    <th className="border border-rose-200 px-2 py-1 text-center">Тип</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {removedSummaries.map(summary => (
                                    <tr key={summary.key} className="odd:bg-white even:bg-rose-100/50">
                                      <td className="border border-rose-200 px-2 py-1 text-center">{summary.exitNumber}</td>
                                      <td className="border border-rose-200 px-2 py-1 text-center">№{summary.routeNumber}</td>
                                      <td className="border border-rose-200 px-2 py-1 text-center">{summary.time}</td>
                                      <td className="border border-rose-200 px-2 py-1">{summary.driver}</td>
                                      <td className="border border-rose-200 px-2 py-1">{summary.bus}</td>
                                      <td className="border border-rose-200 px-2 py-1">{summary.comment}</td>
                                      <td className="border border-rose-200 px-2 py-1 text-center">
                                        {summary.replacementType ? (
                                          <span className="rounded bg-white/70 px-2 py-0.5 text-xs uppercase tracking-wide text-rose-600">
                                            {summary.replacementType}
                                          </span>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                )
              })}

              {removedRows.length > 0 && (
                <section className="break-inside-avoid">
                  <h3 className="mb-2 text-lg font-semibold text-slate-800">Снятые с маршрута</h3>
                  <table className="w-full table-fixed border border-slate-300 text-xs">
                    <thead className="bg-rose-100 text-slate-700">
                      <tr>
                        <th className="border border-slate-300 px-2 py-1">Выход</th>
                        <th className="border border-slate-300 px-2 py-1">Маршрут</th>
                        <th className="border border-slate-300 px-2 py-1">Водитель</th>
                        <th className="border border-slate-300 px-2 py-1">Гос. номер</th>
                        <th className="border border-slate-300 px-2 py-1">Комментарий</th>
                      </tr>
                    </thead>
                    <tbody>
                      {removedRows.map(row => (
                        <tr key={`removed-${row.dispatchBusLineId}`} className="odd:bg-white even:bg-rose-50">
                          <td className="border border-slate-200 px-2 py-1 text-center">{row.busLineNumber}</td>
                          <td className="border border-slate-200 px-2 py-1 text-center">№{row.routeNumber}</td>
                          <td className="border border-slate-200 px-2 py-1">{row.driverName || "-"}</td>
                          <td className="border border-slate-200 px-2 py-1 text-center">{row.busGovNumber || "-"}</td>
                          <td className="border border-slate-200 px-2 py-1">{row.description || row.raw.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {(orderLogs.length > 0 || removedLogs.length > 0) && (
                <section className="grid gap-6 md:grid-cols-2">
                  {orderLogs.length > 0 && (
                    <div className="break-inside-avoid rounded-lg border border-purple-200 bg-purple-50 p-4">
                      <h4 className="mb-3 text-base font-semibold text-slate-800">Заявки/заказы</h4>
                      <table className="w-full table-fixed text-xs">
                        <thead className="text-slate-600">
                          <tr>
                            <th className="border border-purple-200 px-2 py-1">№</th>
                            <th className="border border-purple-200 px-2 py-1">Время</th>
                            <th className="border border-purple-200 px-2 py-1">Статус</th>
                            <th className="border border-purple-200 px-2 py-1">Описание</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderLogs.map((entry, index) => (
                            <tr key={`order-${index}`} className="odd:bg-white even:bg-purple-100/60">
                              <td className="border border-purple-200 px-2 py-1 text-center">{index + 1}</td>
                              <td className="border border-purple-200 px-2 py-1 text-center">{formatActionLogTime(entry.time)}</td>
                              <td className="border border-purple-200 px-2 py-1 text-center">{prettifyStatus(entry.status ?? entry.replacementType ?? "-")}</td>
                              <td className="border border-purple-200 px-2 py-1">{entry.description || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {removedLogs.length > 0 && (
                    <div className="break-inside-avoid rounded-lg border border-rose-200 bg-rose-50 p-4">
                      <h4 className="mb-3 text-base font-semibold text-slate-800">Сходы с линии</h4>
                      <table className="w-full table-fixed text-xs">
                        <thead className="text-slate-600">
                          <tr>
                            <th className="border border-rose-200 px-2 py-1">№</th>
                            <th className="border border-rose-200 px-2 py-1">Время</th>
                            <th className="border border-rose-200 px-2 py-1">Статус</th>
                            <th className="border border-rose-200 px-2 py-1">Описание</th>
                          </tr>
                        </thead>
                        <tbody>
                          {removedLogs.map((entry, index) => (
                            <tr key={`removed-log-${index}`} className="odd:bg-white even:bg-rose-100/60">
                              <td className="border border-rose-200 px-2 py-1 text-center">{index + 1}</td>
                              <td className="border border-rose-200 px-2 py-1 text-center">{formatActionLogTime(entry.time)}</td>
                              <td className="border border-rose-200 px-2 py-1 text-center">{prettifyStatus(entry.status ?? entry.replacementType ?? "-")}</td>
                              <td className="border border-rose-200 px-2 py-1">{entry.description || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }

          .print\:shadow-none {
            box-shadow: none !important;
          }

          main {
            padding: 0 !important;
          }

          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}

export default StatementPrintPage

