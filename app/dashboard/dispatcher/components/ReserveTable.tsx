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

  return (
    <div className="mt-6 border rounded-lg shadow overflow-hidden bg-white">
      <div className="w-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 px-4 py-2 flex items-center gap-3">
        <span className="text-lg font-bold tracking-wide text-black uppercase">РЕЗЕРВ</span>
      </div>

      <div className="flex-1">
        <table className="w-full border text-sm">
          <thead className="bg-yellow-100 text-black">
            <tr>
              <th className="p-2 border">№</th>
              <th className="p-2 border">Гар. номер</th>
              <th className="p-2 border">Гос. номер</th>
              <th className="p-2 border">ФИО</th>
              <th className="p-2 border">Таб. номер</th>
              <th className="p-2 border">Норма (л)</th>
              <th className="p-2 border">Время выхода</th>
              <th className="p-2 border">Доп. информация</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartures.map((r, i) => {
              const key = r.dispatchBusLineId ?? `fallback-${i}`
              const isGoneToRoute = r.isReplace === true
              const isRemoved = r.additionalInfo?.toLowerCase().includes("снят с маршрута")
              const isReplacedAfter = r.additionalInfo?.toLowerCase().includes("резерв после замены")

              return (
                <tr
                  key={key}
                  className={`font-medium ${
                    isRemoved
                      ? "bg-red-100/50"
                      : isReplacedAfter
                      ? "bg-red-50"
                      : isGoneToRoute
                      ? "bg-yellow-50"
                      : i % 2 === 1
                      ? "bg-gray-50"
                      : ""
                  }`}
                >
                  <td className="px-1 py-[2px] border text-center font-semibold">
                    {r.sequenceNumber || i + 1}
                  </td>
                  <td className="px-1 py-[2px] border font-semibold">{r.garageNumber || "—"}</td>
                  <td className="px-1 py-[2px] border font-semibold">{r.govNumber || "—"}</td>
                  <td className="px-1 py-[2px] border font-semibold">
                    {formatShortName(r.driver?.fullName || "—")}
                    {isGoneToRoute && (
                      <span className="ml-2 text-xs text-blue-800 italic">🔁 Назначен на маршрут</span>
                    )}
                    {isRemoved && (
                      <span className="ml-2 text-xs text-red-800 italic">❌ Снят с маршрута</span>
                    )}
                  </td>
                  <td className="px-1 py-[2px] border text-center font-semibold">
                    {r.driver?.serviceNumber || "—"}
                  </td>
                  <td className="px-1 py-[2px] border text-center">
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
                  <td className="px-1 py-[2px] border text-center font-semibold">—</td>
                  <td className="px-1 py-[2px] border font-semibold">
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
    </div>
  )
}
