"use client"

import { useConvoy } from "../context/ConvoyContext"
import { formatDayOfWeek, getMonthName } from "@/app/dashboard/fleet-manager/release-plan/utils/dateUtils"

interface ConvoyHeaderProps {
  driversCount: number
  busesCount: number
  displayDate: Date
  driverOnWork?: number
  busOnWork?: number
  onScrollToReserve?: () => void
}

export default function ConvoyHeader({
  driversCount,
  busesCount,
  displayDate,
  driverOnWork,
  busOnWork,
  onScrollToReserve,
}: ConvoyHeaderProps) {
  const { convoyNumber } = useConvoy()

  return (
    <div className="flex justify-between items-center border px-6 py-4 bg-gray-50 rounded-lg shadow-sm">
      <div className="space-y-1">
        <div>
          <span className="font-semibold">Водителей в колонне:</span> {driversCount}
        </div>
        <div>
          <span className="font-semibold">Автобусов в колонне:</span> {busesCount}
        </div>
        <div>
          <span className="font-semibold">Привл. автобусов:</span> 0
        </div>
      </div>

      <div className="text-center">
        <div className="font-bold text-lg tracking-wide">
          План выпуска · Колонна №{convoyNumber ?? "—"} ({formatDayOfWeek(displayDate)})
        </div>
        <div className="text-sm text-gray-600">
          на {displayDate.toLocaleDateString("ru-RU")} {getMonthName(displayDate)}
        </div>
        {(driverOnWork !== undefined || busOnWork !== undefined) && (
          <div className="text-sm mt-1 text-green-600 font-medium">
            Назначено: водителей — {driverOnWork ?? "—"}, автобусов — {busOnWork ?? "—"}
          </div>
        )}
      </div>

      <button
        onClick={onScrollToReserve}
        className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 rounded text-sm font-semibold text-black shadow"
      >
        ↓ Резерв
      </button>
    </div>
  )
}
