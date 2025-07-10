"use client"

import { useConvoy } from "../context/ConvoyContext"
import { InfoCell } from "./InfoCell"
import type { ReserveAssignment } from "@/types/releasePlanTypes"
import { formatShortName } from "../convoy/[id]/release-plan/utils/driverUtils"
import { useMemo } from "react"

interface ReserveTableProps {
  departures: ReserveAssignment[]
  displayDate: Date
  readOnly?: boolean
  fuelNorms: Record<string, string>
  setFuelNorms: React.Dispatch<React.SetStateAction<Record<string, string>>>
  search?: string
}

export default function ReserveTable({
  departures,
  displayDate,
  readOnly = false,
  fuelNorms,
  setFuelNorms,
  search = "",
}: ReserveTableProps) {
  const { convoyId } = useConvoy()

  const filteredDepartures = useMemo(() => {
    return departures.filter((r) => {
      const fullName = r.driver?.fullName?.toLowerCase() || ""
      const tabNumber = r.driver?.serviceNumber || ""
      return (
        !search ||
        fullName.includes(search.toLowerCase()) ||
        tabNumber.includes(search)
      )
    })
  }, [departures, search])

  const headerClass = "p-2 border text-center bg-yellow-100 text-black text-sm font-semibold"
  const cellClass = "p-2 border text-center text-sm"

  return (
    <div className="overflow-auto rounded-md border print-export mt-6">
      <table className="w-full text-sm text-gray-800 border-collapse">
        <thead>
          <tr>
            <th className={headerClass}>Резерв</th>
            <th className={headerClass}>№</th>
            <th className={headerClass}>Гар. номер</th>
            <th className={headerClass}>Гос. номер</th>
            <th className={headerClass}>ФИО</th>
            <th className={headerClass}>Таб. номер</th>
            <th className={headerClass}>Норма (л)</th>
            <th className={headerClass}>Время выхода</th>
            <th className={headerClass}>Доп. информация</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartures.map((r, i) => {
            const key = r.dispatchBusLineId ?? `fallback-${i}`
            const isGoneToRoute = r.isReplace === true
            const isRemoved = r.additionalInfo?.toLowerCase().includes("снят с маршрута")
            const isReplacedAfter = r.additionalInfo?.toLowerCase().includes("резерв после замены")

            const rowColor = isRemoved
              ? "bg-red-100/50"
              : isReplacedAfter
              ? "bg-red-50"
              : isGoneToRoute
              ? "bg-yellow-50"
              : i % 2 === 1
              ? "bg-gray-50"
              : ""

            return (
              <tr key={key} className={rowColor}>
                {i === 0 && (
                <td
                className="p-2 border text-center font-bold text-black bg-yellow-300 special-bg"
                rowSpan={filteredDepartures.length}
                style={{ minWidth: "80px", verticalAlign: "middle" }}
              >
                РЕЗЕРВ
              </td>                              
                )}
                <td className={cellClass}>{r.sequenceNumber || i + 1}</td>
                <td className={cellClass}>{r.garageNumber || "—"}</td>
                <td className={cellClass}>{r.govNumber || "—"}</td>
                <td className={cellClass}>
                  {formatShortName(r.driver?.fullName || "—")}
                  {isGoneToRoute && (
                    <span className="ml-2 text-xs text-blue-800 italic">🔁 Назначен на маршрут</span>
                  )}
                  {isRemoved && (
                    <span className="ml-2 text-xs text-red-800 italic">❌ Снят с маршрута</span>
                  )}
                </td>
                <td className={cellClass}>{r.driver?.serviceNumber || "—"}</td>
                <td className={cellClass}>
                  <input
                    type="text"
                    value={fuelNorms[key] ?? ""}
                    onChange={(e) =>
                      setFuelNorms((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-16 text-center text-red-600 font-semibold border border-red-300 rounded px-1 py-[2px] outline-none focus:ring-1 focus:ring-red-400"
                    placeholder="—"
                    disabled={readOnly}
                  />
                </td>
                <td className={cellClass}>—</td>
                <td className={cellClass}>
                  {isReplacedAfter && (
                    <span className="ml-2 text-xs text-rose-700 italic">🔄 Снят с маршрута</span>
                  )}
                  <InfoCell
                    initialValue={r.additionalInfo ?? ""}
                    assignmentId={r.dispatchBusLineId}
                    date={displayDate}
                    type="reserve"
                    busId={null}
                    driverId={r.driver?.id ?? null}
                    textClassName="text-red-600 font-semibold"
                    readOnly={readOnly}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
