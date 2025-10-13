import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { StatementRow } from "../types"
import { statusMeta } from "../utils/constants"

interface RemovedRoutesTableProps {
  rows: StatementRow[]
  onReturn: (row: StatementRow) => void
  onViewLog: (row: StatementRow) => void
  statusSubmitting: boolean
}

const RemovedRoutesTable = ({ rows, onReturn, onViewLog, statusSubmitting }: RemovedRoutesTableProps) => {
  if (rows.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-rose-700">Снятые с маршрута</h2>
      <div className="overflow-x-auto rounded-lg border border-rose-200 bg-rose-50/30">
        <table className="min-w-full divide-y">
          <thead className="bg-rose-50">
            <tr className="text-left text-xs uppercase tracking-wide text-rose-700">
              <th className="px-3 py-2">Маршрут</th>
              <th className="px-3 py-2">ВыходD</th>
              <th className="px-3 py-2">Автобус</th>
              <th className="px-3 py-2">Водитель</th>
              <th className="px-3 py-2 text-right">Обороты</th>
              <th className="px-3 py-2">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(row => {
              const meta = statusMeta[row.status] ?? statusMeta.Rejected
              return (
                <tr key={row.dispatchBusLineId} className="bg-rose-50/60">
                  <td className="px-3 py-2 text-sm">{row.routeNumber}</td>
                  <td className="px-3 py-2 text-sm">{row.busLineNumber}</td>
                  <td className="px-3 py-2 text-sm">
                    <div>{row.busGarageNumber ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{row.busGovNumber ?? "—"}</div>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <div>{row.driverName ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{row.driverServiceNumber ?? "—"}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-right">{row.spokenRevolutions ?? "—"}</td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={meta.className}>{meta.label}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => onViewLog(row)}>
                        Журнал
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onReturn(row)}
                        disabled={statusSubmitting}
                      >
                        Вернуть
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RemovedRoutesTable