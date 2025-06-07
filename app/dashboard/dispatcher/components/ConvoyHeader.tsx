"use client"

import { useConvoy } from "../context/ConvoyContext"
import { formatDayOfWeek, getMonthName } from "@/app/dashboard/fleet-manager/release-plan/utils/dateUtils"
import { Search, X } from "lucide-react"

interface ConvoyHeaderProps {
  driversCount: number
  busesCount: number
  displayDate: Date
  driverOnWork?: number
  busOnWork?: number
  onScrollToReserve?: () => void
  searchQuery: string
  onSearch: (query: string) => void
  onResetSearch: () => void
  isSearchActive: boolean
}

export default function ConvoyHeader({
  driversCount,
  busesCount,
  displayDate,
  driverOnWork,
  busOnWork,
  onScrollToReserve,
  searchQuery,
  onSearch,
  onResetSearch,
  isSearchActive,
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

      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Поиск по ФИО или табельному..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          {isSearchActive && (
            <button
              onClick={onResetSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={onScrollToReserve}
          className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 rounded text-sm font-semibold text-black shadow"
        >
          ↓ Резерв
        </button>
      </div>
    </div>
  )
}
