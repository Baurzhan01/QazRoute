import type { StatementActionLog } from "../types"
import {
  formatActionLogBus,
  formatActionLogDriver,
  formatActionLogTime,
} from "../utils/helpers"

interface StatementActionLogListProps {
  title: string
  entries: StatementActionLog[]
  variant: "order" | "removed"
}

const variantClasses: Record<"order" | "removed", string> = {
  order: "border-purple-200 bg-purple-50",
  removed: "border-rose-200 bg-rose-50",
}

const StatementActionLogList = ({ title, entries, variant }: StatementActionLogListProps) => {
  if (!entries.length) return null

  return (
    <section className={`rounded-xl border ${variantClasses[variant]}`}>
      <header className="flex items-center justify-between border-b border-transparent px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <span className="text-xs text-muted-foreground">Записей: {entries.length}</span>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">№</th>
              <th className="px-3 py-2">Время</th>
              <th className="px-3 py-2">Описание</th>
              <th className="px-3 py-2">Тип</th>
              <th className="px-3 py-2">Водитель</th>
              <th className="px-3 py-2">Автобус</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={`${entry.time}-${index}`} className="odd:bg-white even:bg-white/60">
                <td className="px-3 py-2 align-top text-slate-700">{index + 1}</td>
                <td className="px-3 py-2 align-top text-slate-700">{formatActionLogTime(entry.time)}</td>
                <td className="px-3 py-2 align-top text-slate-700">{entry.description || "—"}</td>
                <td className="px-3 py-2 align-top text-slate-700">{entry.replacementType || "—"}</td>
                <td className="px-3 py-2 align-top text-slate-700">{formatActionLogDriver(entry.driver)}</td>
                <td className="px-3 py-2 align-top text-slate-700">{formatActionLogBus(entry.bus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default StatementActionLogList