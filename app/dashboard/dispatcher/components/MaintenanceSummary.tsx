"use client"

import { useState } from "react"
import { Wrench } from "lucide-react"

interface MaintenanceSummaryProps {
  repairBuses: string[]
  dayOffBuses: string[]
  driverOnWork?: number
  busOnWork?: number
}

export default function MaintenanceSummary({
  repairBuses,
  dayOffBuses,
  driverOnWork,
  busOnWork,
}: MaintenanceSummaryProps) {
  const [showDayOffBuses, setShowDayOffBuses] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-3 mt-4">
      {/* 🔧 Ремонт */}
      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <h4 className="font-bold text-sky-700 mb-3 flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Ремонт
        </h4>
        <div className="flex flex-wrap gap-2">
          {repairBuses.length > 0 ? (
            repairBuses.map((bus, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white border rounded text-sm font-semibold shadow-sm"
              >
                {bus}
              </span>
            ))
          ) : (
            <span className="text-gray-400">Нет автобусов в ремонте</span>
          )}
        </div>
      </div>

      {/* 🚫 Выходной */}
      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <h4 className="font-bold text-red-700 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-xl">🚫</span> Автобусы на выходном
            <span className="text-sm text-gray-500">({dayOffBuses.length})</span>
          </span>
          {dayOffBuses.length > 0 && (
            <button
              onClick={() => setShowDayOffBuses((prev) => !prev)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showDayOffBuses ? "Скрыть" : "Показать"}
            </button>
          )}
        </h4>

        {showDayOffBuses && (
          <div className="flex flex-wrap gap-1">
            {dayOffBuses.map((bus, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white border rounded text-sm font-semibold shadow-sm"
              >
                {bus}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Назначено */}
      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
          <span className="text-xl">📊</span> Назначено
        </h4>
        <ul className="text-sm text-gray-800 font-semibold space-y-1">
          <li>• Водителей: {driverOnWork ?? "—"}</li>
          <li>• Автобусов: {busOnWork ?? "—"}</li>
        </ul>
      </div>
    </div>
  )
}
