"use client"

import { useState } from "react"
import { BusFront } from "lucide-react"
import AssignmentCell from "./AssignmentCell"
import { formatShortName } from "../convoy/[id]/release-plan/utils/driverUtils"
import { releasePlanService } from "@/service/releasePlanService"
import { useConvoy } from "../context/ConvoyContext"
import type { RouteGroup, RouteAssignment } from "@/types/releasePlanTypes"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"

interface RouteGroupTableProps {
  group: RouteGroup
  displayDate: Date
  readOnly?: boolean
  fuelNorms: Record<string, string>
  setFuelNorms: React.Dispatch<React.SetStateAction<Record<string, string>>>
  checkedDepartures: Record<string, boolean>
  setCheckedDepartures: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  onDriverClick: (driver: { id: string } | null) => void
  onReplaceClick: (
    assignment: RouteAssignment,
    onSuccess: (updated: RouteAssignment) => void
  ) => void
  onRemoveClick: (assignment: RouteAssignment) => void
  onReload?: () => void
  onReplaceSuccess?: (updated: RouteAssignment) => void
}

export default function RouteGroupTable({
  group,
  displayDate,
  readOnly = false,
  fuelNorms,
  setFuelNorms,
  checkedDepartures,
  setCheckedDepartures,
  onDriverClick,
  onReplaceClick,
  onRemoveClick,
  onReload,
  onReplaceSuccess,
}: RouteGroupTableProps) {
  const { convoyId } = useConvoy()
  const [assignments, setAssignments] = useState(group.assignments)

  const handleReplaceSuccess = (updated: RouteAssignment) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.dispatchBusLineId === updated.dispatchBusLineId
          ? {
              ...a,
              bus: updated.bus,
              driver: updated.driver,
              garageNumber: updated.garageNumber ?? updated.bus?.garageNumber,
              stateNumber: updated.stateNumber ?? updated.bus?.govNumber,
              status: updated.status,
            }
          : a
      )
    )
    onReplaceSuccess?.(updated)
  }
  return (
    <div className="mt-2 border rounded-lg shadow-md overflow-hidden bg-white">
      <div className="w-full bg-gradient-to-r from-sky-100 via-sky-200 to-sky-100 px-3 py-1.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-4">
          <BusFront className="w-8 h-8 text-sky-800" />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-sky-900 tracking-wider">
              Маршрут №{group.routeNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-sky-100 text-sky-900">
            <tr>
              <th className="p-2 border">№</th>
              <th className="p-2 border">Гар. номер</th>
              <th className="p-2 border">Гос. номер</th>
              <th className="p-2 border">ФИО</th>
              <th className="p-2 border">Таб. номер</th>
              <th className="p-2 border">Норма (л)</th>
              <th className="p-2 border">Время выхода</th>
              <th className="p-2 border">По графику</th>
              <th className="p-2 border">Доп. информация</th>
              {assignments.some(a => a.shift2Driver) && (
                <>
                  <th className="p-2 border">Пересменка</th>
                  <th className="p-2 border">ФИО</th>
                  <th className="p-2 border">Таб. номер</th>
                </>
              )}
              <th className="p-2 border">Конец</th>
              <th className="p-2 border">Отметка</th>
              <th className="p-2 border text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {[...assignments]
              .sort((a, b) => parseInt(a.busLineNumber) - parseInt(b.busLineNumber))
              .map((a, i) => {
                const isReplaced = a.status === DispatchBusLineStatus.Replaced
                const isPermutation = a.status === DispatchBusLineStatus.Permutation
                const isReleased = a.status === DispatchBusLineStatus.Released

                const rowColor = isReplaced
                  ? "bg-yellow-50"
                  : isPermutation
                  ? "bg-sky-50"
                  : isReleased
                  ? "bg-green-50"
                  : i % 2 === 1
                  ? "bg-gray-50"
                  : ""

                  const handleCheckboxChange = async (assignment: RouteAssignment, checked: boolean) => {
                    const dispatchId = assignment.dispatchBusLineId
                    const currentStatus = assignment.status
                
                    let newStatus = currentStatus
                    let newIsRealsed = checked
                    let newReleasedTime = checked ? new Date().toISOString().slice(11, 19) : ""
                
                    if (checked) {
                      // ✅ Установка отметки: статус Released только если был Undefined
                      if (currentStatus === DispatchBusLineStatus.Undefined) {
                        newStatus = DispatchBusLineStatus.Released
                      }
                    } else {
                      // ❌ Снятие отметки: всегда сбрасываем флаг и время
                      newIsRealsed = false
                      newReleasedTime = ""
                
                      // Только если был Released — сбрасываем статус на Undefined
                      if (currentStatus === DispatchBusLineStatus.Released) {
                        newStatus = DispatchBusLineStatus.Undefined
                      } else if (
                        currentStatus === DispatchBusLineStatus.Replaced ||
                        currentStatus === DispatchBusLineStatus.Permutation
                      ) {
                        // Для Replaced и Permutation статус остаётся, но сбрасываем флаги
                        newStatus = currentStatus
                      }
                    }
                
                    setCheckedDepartures((prev) => ({ ...prev, [dispatchId]: checked }))
                
                    try {
                      await releasePlanService.updateDispatchStatus(dispatchId, Number(newStatus), newIsRealsed)
                      console.log("⬆️ Отправляем статус:", { newStatus, newIsRealsed })
                
                      setAssignments((prev) =>
                        prev.map((a) =>
                          a.dispatchBusLineId === dispatchId
                            ? {
                                ...a,
                                status: newStatus,
                                isRealsed: newIsRealsed,
                                releasedTime: newReleasedTime,
                              }
                            : a
                        )
                      )
                    } catch (err) {
                      console.error("Ошибка обновления статуса:", err)
                      setCheckedDepartures((prev) => ({ ...prev, [dispatchId]: !checked }))
                    }
                  }
                  
                return (
                  <tr key={a.dispatchBusLineId} className={`font-medium ${rowColor}`}>
                    <td className="px-1 py-[2px] border text-center font-semibold">{a.busLineNumber ?? "—"}</td>
                    <td className="px-1 py-[2px] border font-semibold">{a.garageNumber}</td>
                    <td className="px-1 py-[2px] border font-semibold">{a.stateNumber}</td>
                    <td className="px-1 py-[2px] border font-semibold">
                      {formatShortName(a.driver?.fullName ?? "—")}
                    </td>
                    <td
                      className="px-1 py-[2px] border font-semibold text-center text-black-600 hover:underline cursor-pointer"
                      onClick={() => onDriverClick(a.driver)}
                    >
                      {a.driver?.serviceNumber ?? "—"}
                    </td>
                    <td className="px-1 py-[2px] border text-center">
                      <input
                        type="text"
                        value={fuelNorms[a.dispatchBusLineId] ?? a.fuelAmount ?? ""}
                        onChange={(e) =>
                          setFuelNorms((prev) => ({ ...prev, [a.dispatchBusLineId]: e.target.value }))
                        }
                        onBlur={async () => {
                          const value = fuelNorms[a.dispatchBusLineId]
                          try {
                            await releasePlanService.updateSolarium(a.dispatchBusLineId, value)
                          } catch (error) {
                            console.error("Ошибка при обновлении солярки:", error)
                          }
                        }}
                        className="w-16 text-center text-red-600 font-semibold border border-red-300 rounded px-1 py-[2px] outline-none focus:ring-1 focus:ring-red-400"
                        placeholder="—"
                      />
                    </td>
                    <td className="px-1 py-[2px] border text-center font-semibold leading-tight">
                      <div>{a.departureTime || "—"}</div>
                      {a.releasedTime && a.releasedTime !== "00:00:00" && (
                        <div className="text-[11px] text-green-600 mt-0.5">
                          {a.releasedTime.slice(0, 5)} — путевой лист
                        </div>
                      )}
                    </td>
                    <td className="px-1 py-[2px] border text-center font-semibold">{a.scheduleTime}</td>
                    <td className="px-1 py-[2px] border font-semibold">
                      <AssignmentCell assignment={a} date={displayDate} readOnly={readOnly} />
                    </td>
                    {a.shift2Driver && <td className="px-1 py-[2px] border font-semibold">{a.shift2AdditionalInfo ?? "—"}</td>}
                    {a.shift2Driver && <td className="px-1 py-[2px] border font-semibold">{formatShortName(a.shift2Driver?.fullName)}</td>}
                    {a.shift2Driver && <td className="px-1 py-[2px] border text-center font-semibold">{a.shift2Driver?.serviceNumber ?? "—"}</td>}
                    <td className="px-1 py-[2px] border font-semibold">{a.endTime}</td>
                    <td className="px-1 py-[2px] border text-center font-semibold">
                      {checkedDepartures[a.dispatchBusLineId]
                        ? <span className="text-green-800">✅ Вышел</span>
                        : "—"}
                    </td>
                    <td className="px-1 py-[2px] border font-semibold text-center space-x-1">
                      <label className="inline-flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedDepartures[a.dispatchBusLineId] ?? false}
                          onChange={(e) => handleCheckboxChange(a, e.target.checked)}
                          className="accent-green-600 w-4 h-4"
                        />
                        <span className="text-xs font-medium text-gray-700">Вышел</span>
                      </label>
                      <button
                        onClick={() =>
                            onReplaceClick(a, handleReplaceSuccess)
                        }
                        className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded border border-blue-400"
                      >
                        Заменить
                      </button>
                      <button
                        onClick={() => onRemoveClick(a)}
                        className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded border border-red-400"
                      >
                        Снят
                      </button>
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