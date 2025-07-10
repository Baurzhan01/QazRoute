"use client"

import type { RepairRecord } from "../../repairs/planned/hooks/usePlannedRepairs"
import { formatShortName } from "../convoy/[id]/release-plan/utils/driverUtils"

interface ScheduledRepairTableProps {
  repairs: RepairRecord[]
}

export default function ScheduledRepairTable({ repairs }: ScheduledRepairTableProps) {
  if (!repairs?.length) return null

  const headerClass = "p-2 border text-center bg-red-100 text-black text-sm font-semibold"
  const cellClass = "p-2 border text-center text-sm"

  return (
    <div className="overflow-auto rounded-md border print-export mt-6">
      <table className="w-full text-sm text-gray-800 border-collapse">
        <thead>
          <tr>
            <th className={headerClass}>План. ремонт</th>
            <th className={headerClass}>Гар. номер</th>
            <th className={headerClass}>Гос. номер</th>
            <th className={headerClass}>ФИО</th>
            <th className={headerClass}>Таб. номер</th>
            <th className={headerClass}>Описание</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, i) => (
            <tr key={r.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
              {i === 0 && (
                <td
                  className="p-2 border text-center font-bold text-black bg-red-300 align-middle special-repair-bg"
                  rowSpan={repairs.length}
                  style={{ minWidth: "80px", verticalAlign: "middle" }}
                >
                  ПЛАН. РЕМОНТ
                </td>
              )}
              <td className={cellClass}>{r.bus.garageNumber || "—"}</td>
              <td className={cellClass}>{r.bus.govNumber || "—"}</td>
              <td className={cellClass}>{formatShortName(r.driver.fullName)}</td>
              <td className={cellClass}>{r.driver.serviceNumber || "—"}</td>
              <td className="p-2 border text-red-700 font-semibold text-sm text-center">
                {r.description || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
