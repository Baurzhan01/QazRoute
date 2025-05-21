"use client"

import type React from "react"
import type { DispatcherShift, MonthData, ShiftType } from "../types/shift.types"
import type { WorkShiftType } from "@/types/coordinator.types"
import { ShiftSelector } from "./ShiftSelector"
import { shiftToApi, apiToShift } from "../utils/shiftTypeMapper"


interface ShiftTableRowProps {
  dispatcher: DispatcherShift
  monthData: MonthData
  onShiftUpdate: (dispatcherId: string, date: string, shiftType: WorkShiftType) => void
  isLoading: boolean
}

export const ShiftTableRow: React.FC<ShiftTableRowProps> = ({
  dispatcher,
  monthData,
  onShiftUpdate,
  isLoading,
}) => {
  const { year, month, daysInMonth } = monthData

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Получение типа смены по дате
  const getShiftForDay = (day: number): WorkShiftType => {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const shift = dispatcher.shifts.find((s) => s.date === date)
    return shiftToApi(shift?.shift ?? "day")
  }

  // Обновление смены
  const handleShiftChange = (day: number, shiftType: WorkShiftType) => {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    onShiftUpdate(dispatcher.dispatcherId, date, shiftType)
  }

  // Подсчёт количества смен по типу
  const countShifts = (): Record<WorkShiftType, number> => {
    const counts: Record<WorkShiftType, number> = {
      Day: 0,
      Night: 0,
      DayOff: 0,
      Vacation: 0,
      Skip: 0,
    }

    days.forEach((day) => {
      const shift = getShiftForDay(day)
      counts[shift]++
    })

    return counts
  }

  const counts = countShifts()

  return (
    <tr className="bg-white hover:bg-gray-50">
      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
        {dispatcher.fullName}
      </td>

      {days.map((day) => (
        <td key={day} className="p-1 text-center">
          <ShiftSelector
            currentShift={getShiftForDay(day)}
            onShiftSelect={(shiftType) => handleShiftChange(day, shiftType)}
            disabled={isLoading}
          />
        </td>
      ))}

      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 sticky right-0 bg-white z-10">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-amber-600">
            <span>День:</span>
            <span>{counts.Day}</span>
          </div>
          <div className="flex justify-between text-purple-600">
            <span>Ночь:</span>
            <span>{counts.Night}</span>
          </div>
          <div className="flex justify-between text-blue-600">
            <span>Отпуск:</span>
            <span>{counts.Vacation}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Выходной:</span>
            <span>{counts.DayOff}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Пропуск:</span>
            <span>{counts.Skip}</span>
          </div>
        </div>
      </td>
    </tr>
  )
}
