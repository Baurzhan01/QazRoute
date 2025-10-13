"use client"

import { EllipsisVertical, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { RouteBucket, StatementRow } from "../types"
import { ACTION_LOG_STATUS_LABELS, StatementAction, actionsByStatus, statusMeta } from "../utils/constants"
import {
  formatActionLogBus,
  formatActionLogDriver,
  formatActionLogTime,
} from "../utils/helpers"

const actionLabels: Record<StatementAction, string> = {
  [StatementAction.Replace]: "Замена",
  [StatementAction.ReportGotOff]: "Сообщить о сходе",
  [StatementAction.SendToOrder]: "Отправить на заказ",
  [StatementAction.Complete]: "Завершить рейс",
  [StatementAction.Remove]: "Снять с маршрута",
  [StatementAction.ReturnToLine]: "Вернуть на линию",
  [StatementAction.ViewLog]: "Журнал",
}

interface StatementRoutesTableProps {
  routes: RouteBucket[]
  pendingInputs: Record<string, string>
  savingRows: Record<string, boolean>
  onInputChange: (dispatchBusLineId: string, value: string) => void
  onAction: (action: StatementAction, row: StatementRow) => void
  actionsDisabled?: boolean
}

const renderStatusCell = (row: StatementRow) => {
  const meta = statusMeta[row.status] ?? statusMeta.Unknown
  const className = meta.className || "bg-slate-100 text-slate-700 border border-slate-200"

  return (
    <span className={`inline-flex min-w-[96px] justify-center rounded-md px-2 py-1 text-sm font-semibold ${className}`}>
      {meta.label}
    </span>
  )
}

const formatDriverName = (fullName?: string | null, serviceNumber?: string | null): string => {
  if (!fullName) return "-"

  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return "-"

  const [surname, ...rest] = parts
  const initials = rest.map(part => (part ? `${part[0].toUpperCase()}.` : "")).join("")
  const formatted = initials ? `${surname} ${initials}` : surname
  return serviceNumber ? `${formatted} (${serviceNumber})` : formatted
}

const StatementRoutesTable = ({
  routes,
  pendingInputs,
  savingRows,
  onInputChange,
  onAction,
  actionsDisabled = false,
}: StatementRoutesTableProps) => {
  if (routes.length === 0) return null

  return (
    <div className="space-y-8">
      {routes.map(route => {
        const displayedRows = route.rows.filter(row => {
          const hasRemovedHistory = (row.raw.removed?.length ?? 0) > 0
          return !(row.status === "Rejected" && hasRemovedHistory)
        })

        const planTotal = displayedRows.reduce((acc, row) => acc + (row.planRevolutions ?? 0), 0)
        const factTotal = displayedRows.reduce((acc, row) => acc + (row.factRevolutions ?? 0), 0)
        const spokenTotal = displayedRows.reduce((acc, row) => acc + (row.spokenRevolutions ?? 0), 0)

        const removedSummaries = route.rows.flatMap(row =>
          (row.raw.removed ?? []).map((entry, index) => ({
            key: `${row.dispatchBusLineId}-removed-${index}`,
            exitNumber: row.busLineNumber,
            driver: formatDriverName(entry.driver?.fullName ?? row.driverName, entry.driver?.serviceNumber ?? row.driverServiceNumber),
            bus: formatActionLogBus(entry.bus),
            plan: row.planRevolutions ?? 0,
            fact: row.factRevolutions ?? 0,
            spoken: row.spokenRevolutions ?? 0,
            reason: entry.description || row.description || "Без комментария",
          }))
        )

        const orderSummaries = route.rows.flatMap(row =>
          (row.raw.onOrder ?? []).map((entry, index) => ({
            key: `${row.dispatchBusLineId}-order-${index}`,
            exitNumber: row.busLineNumber,
            driver: formatDriverName(entry.driver?.fullName ?? row.driverName, entry.driver?.serviceNumber ?? row.driverServiceNumber),
            bus: formatActionLogBus(entry.bus),
            plan: row.planRevolutions ?? 0,
            fact: row.factRevolutions ?? 0,
            spoken: row.spokenRevolutions ?? 0,
            note: entry.description || row.description || "Без комментария",
          }))
        )

        return (
          <section key={route.id} className="rounded-xl border bg-white shadow-sm">
            <header className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-700">Маршрут №{route.number}</h2>
              <span className="text-sm text-muted-foreground">Выходов: {displayedRows.length}</span>
            </header>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="border px-3 py-2 text-center">№</th>
                    <th className="border px-3 py-2">Гос. номер</th>
                    <th className="border px-3 py-2">Гар. номер</th>
                    <th className="border px-3 py-2">Таб. номер</th>
                    <th className="border px-3 py-2 text-right">План</th>
                    <th className="border px-3 py-2 text-right">Факт</th>
                    <th className="border px-3 py-2 text-right">Со слов</th>
                    <th className="border px-3 py-2">Примечание</th>
                    <th className="border px-3 py-2 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row, index) => {
                   const hasLogs =
                   (row.raw.onOrder && row.raw.onOrder.length > 0) ||
                   (row.raw.removed && row.raw.removed.length > 0)
               
                // ✅ проверяем оба варианта поля
                const isGotOff =
                row.raw.statementStatus === "GotOff" ||
                (row.raw as any).statemtStatus === "GotOff"
                 const actionStatusLabel =
                   isGotOff && row.raw.actionStatus
                     ? ACTION_LOG_STATUS_LABELS[row.raw.actionStatus as keyof typeof ACTION_LOG_STATUS_LABELS]
                     : null
               
                 // 🎨 Цвет строки
                 const rowBackground = isGotOff
                   ? "bg-yellow-200 hover:bg-yellow-100 transition-colors"
                   : index % 2 === 0
                   ? "bg-white"
                   : "bg-slate-50/60"
               
                 // 📝 Примечание
                 const note = isGotOff
                   ? `Сход — ${actionStatusLabel || "Без причины"}`
                   : row.description?.trim() ||
                     row.raw.description?.trim() ||
                     (hasLogs ? "Журнал событий" : "-")
               
                 // ⚙️ Действия
                 const actions = actionsByStatus[row.status] ?? []
                 
                    return (
                      <tr key={row.dispatchBusLineId} className={rowBackground}>
                         <td className="border px-3 py-2 text-center text-sm font-medium text-slate-700">
                            {index + 1}
                          </td>
                          <td className="border px-3 py-2 text-sm text-slate-700">{row.busGovNumber || "-"}</td>
                          <td className="border px-3 py-2 text-sm text-slate-700">{row.busGarageNumber || "-"}</td>
                          <td className="border px-3 py-2 text-sm text-slate-700">{row.driverServiceNumber || "-"}</td>
                          <td className="border px-3 py-2 text-right text-sm tabular-nums text-slate-700">
                            {row.planRevolutions ?? 0}
                          </td>
                          <td className="border px-3 py-2 text-right text-sm tabular-nums text-slate-700">
                            {row.factRevolutions ?? 0}
                          </td>
                          <td className="border px-3 py-2 text-right text-sm tabular-nums text-slate-700">
                            {row.spokenRevolutions ?? 0}
                          </td>
                        {/* Примечание */}
                        <td className="border px-3 py-2 text-sm text-slate-700">
                          {hasLogs ? (
                            <button
                              onClick={() => onAction(StatementAction.ViewLog, row)}
                              className="text-sky-600 hover:underline"
                            >
                              Журнал событий
                            </button>
                          ) : (
                            note
                          )}
                        </td>

                        {/* Действия */}
                        <td className="border px-3 py-2 text-center">
                          {actions.length === 0 ? (
                            <span className="text-xs text-muted-foreground">Нет действий</span>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  disabled={actionsDisabled}
                                >
                                  <EllipsisVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                {actions
                                  // 🟡 фильтруем "Вернуть на линию" — только если GotOff
                                  .filter(action => {
                                    if (action === StatementAction.ReturnToLine) {
                                      return row.raw.statementStatus === "GotOff"
                                    }
                                    return true
                                  })
                                  .map(action => (
                                    <DropdownMenuItem
                                      key={action}
                                      onClick={() => onAction(action, row)}
                                    >
                                      {actionLabels[action]}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-slate-100 font-semibold text-slate-700">
                    <td className="border px-3 py-2 text-right" colSpan={4}>
                      Итого
                    </td>
                    <td className="border px-3 py-2 text-right tabular-nums">{planTotal}</td>
                    <td className="border px-3 py-2 text-right tabular-nums">{factTotal}</td>
                    <td className="border px-3 py-2 text-right tabular-nums">{spokenTotal}</td>
                    <td className="border px-3 py-2" colSpan={4}></td>
                    <td className="border px-3 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {(orderSummaries.length > 0 || removedSummaries.length > 0) && (
              <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-4 space-y-4">
                {orderSummaries.length > 0 && (
                  <div className="border border-purple-200 bg-purple-50/60">
                    <div className="flex items-center justify-between border-b border-purple-200 bg-purple-100/60 px-3 py-2">
                      <h3 className="text-sm font-semibold text-purple-700">Отправлены на заказ</h3>
                      <span className="text-xs text-purple-600">Всего: {orderSummaries.length}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-xs uppercase tracking-wide text-purple-600">
                          <tr>
                            <th className="border border-purple-200 px-2 py-1 text-center">Выход</th>
                            <th className="border border-purple-200 px-2 py-1 text-center">Водитель</th>
                            <th className="border border-purple-200 px-2 py-1">Автобус</th>
                            <th className="border border-purple-200 px-2 py-1 text-right">План</th>
                            <th className="border border-purple-200 px-2 py-1 text-right">Факт</th>
                            <th className="border border-purple-200 px-2 py-1 text-right">Со слов</th>
                            <th className="border border-purple-200 px-2 py-1">Комментарий</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderSummaries.map(summary => (
                            <tr key={summary.key} className="odd:bg-white even:bg-purple-100/40">
                              <td className="border border-purple-200 px-2 py-1 text-center">{summary.exitNumber}</td>
                              <td className="border border-purple-200 px-2 py-1">{summary.driver}</td>
                              <td className="border border-purple-200 px-2 py-1">{summary.bus}</td>
                              <td className="border border-purple-200 px-2 py-1 text-right">{summary.plan}</td>
                              <td className="border border-purple-200 px-2 py-1 text-right">{summary.fact}</td>
                              <td className="border border-purple-200 px-2 py-1 text-right">{summary.spoken}</td>
                              <td className="border border-purple-200 px-2 py-1">{summary.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {removedSummaries.length > 0 && (
                  <div className="border border-rose-200 bg-rose-50/60">
                    <div className="flex items-center justify-between border-b border-rose-200 bg-rose-100/70 px-3 py-2">
                      <h3 className="text-sm font-semibold text-rose-700">Снятые с выхода</h3>
                      <span className="text-xs text-rose-600">Всего: {removedSummaries.length}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-xs uppercase tracking-wide text-rose-600">
                          <tr>
                            <th className="border border-rose-200 px-2 py-1 text-center">Выход</th>
                            <th className="border border-rose-200 px-2 py-1 text-center">Водитель</th>
                            <th className="border border-rose-200 px-2 py-1">Автобус</th>
                            <th className="border border-rose-200 px-2 py-1 text-right">План</th>
                            <th className="border border-rose-200 px-2 py-1 text-right">Факт</th>
                            <th className="border border-rose-200 px-2 py-1 text-right">Со слов</th>
                            <th className="border border-rose-200 px-2 py-1">Причина</th>
                          </tr>
                        </thead>
                        <tbody>
                          {removedSummaries.map(summary => (
                            <tr key={summary.key} className="odd:bg-white even:bg-rose-100/50">
                              <td className="border border-rose-200 px-2 py-1 text-center">{summary.exitNumber}</td>
                              <td className="border border-rose-200 px-2 py-1">{summary.driver}</td>
                              <td className="border border-rose-200 px-2 py-1">{summary.bus}</td>
                              <td className="border border-rose-200 px-2 py-1 text-right">{summary.plan}</td>
                              <td className="border border-rose-200 px-2 py-1 text-right">{summary.fact}</td>
                              <td className="border border-rose-200 px-2 py-1 text-right">{summary.spoken}</td>
                              <td className="border border-rose-200 px-2 py-1">{summary.reason}</td>
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
    </div>
  )
}

export default StatementRoutesTable
