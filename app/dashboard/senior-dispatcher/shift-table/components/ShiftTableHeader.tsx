"use client"

import type React from "react"
import type { MonthData } from "../types/shift.types"

interface ShiftTableHeaderProps {
  monthData: MonthData
}

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
]

export const ShiftTableHeader: React.FC<ShiftTableHeaderProps> = ({ monthData }) => {
  const { year, month, daysInMonth } = monthData
  const monthName = monthNames[month - 1]

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <thead className="bg-gray-50">
      <tr>
        <th
          colSpan={daysInMonth + 2}
          className="px-6 py-3 text-center text-lg font-semibold text-gray-900"
        >
          Табель рабочего времени диспетчеров — {monthName} {year}
        </th>
      </tr>
      <tr>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[200px]"
        >
          ФИО диспетчера
        </th>
        {days.map((day) => (
          <th
            key={day}
            scope="col"
            className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10"
            aria-label={`День ${day}`}
          >
            {day}
          </th>
        ))}
        <th
          scope="col"
          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10"
        >
          Итого
        </th>
      </tr>
    </thead>
  )
}
