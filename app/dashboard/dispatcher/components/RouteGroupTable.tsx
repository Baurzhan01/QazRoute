"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal } from "lucide-react"
import AssignmentCell from "./AssignmentCell"
import { releasePlanService } from "@/service/releasePlanService"
import { useConvoy } from "../context/ConvoyContext"
import { formatShortName } from "../convoy/[id]/release-plan/utils/driverUtils"
import type { RouteAssignment, RouteGroup } from "@/types/releasePlanTypes"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface RouteGroupTableProps {
  group: RouteGroup
  displayDate: Date
  readOnly?: boolean
  fuelNorms: Record<string, string>
  setFuelNorms: React.Dispatch<React.SetStateAction<Record<string, string>>>
  checkedDepartures: Record<string, boolean>
  setCheckedDepartures: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  onDriverClick: (driver: { id: string } | null) => void
  onReplaceClick: (assignment: RouteAssignment, onSuccess: (updated: RouteAssignment) => void) => void
  onRemoveClick: (assignment: RouteAssignment) => void
  onReload?: () => void
  onReplaceSuccess?: (updated: RouteAssignment) => void
  search?: string
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
  const [assignments, setAssignments] = useState<RouteAssignment[]>(group.assignments)

  useEffect(() => {
    setAssignments(group.assignments)
  }, [group.assignments])

  const handleReplaceSuccess = (updated: RouteAssignment & {
    oldBus?: { garageNumber?: string; stateNumber?: string }
    oldDriver?: { fullName?: string }
  }) => {
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
              oldBus: updated.oldBus,
              oldDriver: updated.oldDriver,
            }
          : a
      )
    )
    onReplaceSuccess?.(updated)
  }

  const handleCheckboxChange = async (assignment: RouteAssignment, checked: boolean) => {
    const dispatchId = assignment.dispatchBusLineId
    const currentStatus = assignment.status

    let newStatus = currentStatus
    let newIsRealsed = checked
    let newReleasedTime = checked
  ? new Date().toLocaleTimeString("ru-RU", { hour12: false }).slice(0, 5) + ":00"
  : ""


    if (checked) {
      if (currentStatus === DispatchBusLineStatus.Undefined) {
        newStatus = DispatchBusLineStatus.Released
      }
    } else {
      newIsRealsed = false
      newReleasedTime = ""

      if (currentStatus === DispatchBusLineStatus.Released) {
        newStatus = DispatchBusLineStatus.Undefined
      } else if (
        currentStatus === DispatchBusLineStatus.Replaced ||
        currentStatus === DispatchBusLineStatus.Permutation
      ) {
        newStatus = currentStatus
      }
    }

    setCheckedDepartures((prev) => ({ ...prev, [dispatchId]: checked }))

    try {
      await releasePlanService.updateDispatchStatus(dispatchId, Number(newStatus), newIsRealsed)

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

  const formatTimeHHMM = (time?: string) => {
    return time?.length === 8 ? time.slice(0, 5) : time || "—"
  }  

  const headerClass = "p-2 border text-center bg-sky-100 text-sky-900 text-sm font-semibold"
  const cellClass = "p-2 border text-center text-sm"

  return (
    <div className="overflow-auto rounded-md border print-export mt-3">
      <table className="w-full text-sm text-gray-800 border-collapse">
        <thead>
          <tr>
            <th className={headerClass}>Маршрут</th>
            <th className={headerClass}>№</th>
            <th className={headerClass}>Гар. номер</th>
            <th className={headerClass}>Гос. номер</th>
            <th className={headerClass}>ФИО</th>
            <th className={headerClass}>Таб. номер</th>
            <th className={headerClass}>Норма (л)</th>
            <th className={headerClass}>Время выхода</th>
            <th className={headerClass}>По графику</th>
            <th className={headerClass}>Доп. информация</th>
            <th className={headerClass}>Конец</th>
            <th className={headerClass}>Отметка</th>
            <th className={headerClass}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {[...assignments]
            .sort((a, b) => parseInt(a.busLineNumber) - parseInt(b.busLineNumber))
            .map((a, index) => {
              const dispatchId = a.dispatchBusLineId
              const isChecked = checkedDepartures[dispatchId]
              const showRouteNumber = index === 0

              const isReplaced = a.status === DispatchBusLineStatus.Replaced
              const isPermutation = a.status === DispatchBusLineStatus.Permutation
              const isReleased = a.status === DispatchBusLineStatus.Released

              const rowColor = isReplaced
                ? "bg-yellow-50"
                : isPermutation
                ? "bg-blue-50"
                : isReleased
                ? "bg-green-50"
                : ""

              return (
                <tr key={dispatchId} className={rowColor}>
                  {showRouteNumber ? (
                    <td
                    className="p-2 border text-center text-sm font-bold align-middle bg-[#e0f2fe] special-route-bg"
                    rowSpan={assignments.length}
                    style={{ minWidth: '120px', verticalAlign: 'middle' }}
                  >
                    {group.routeNumber}
                  </td>                  
                  ) : null}

                  <td className={cellClass}>{a.busLineNumber}</td>
                  <td className={cellClass}>{a.garageNumber}</td>
                  <td className={cellClass}>{a.stateNumber}</td>
                  <td className={cellClass}>{formatShortName(a.driver?.fullName)}</td>
                  <td
                    className={`${cellClass} cursor-pointer hover:underline`}
                    onClick={() => onDriverClick(a.driver)}
                  >
                    {a.driver?.serviceNumber ?? "—"}
                  </td>
                  <td className={cellClass}>
                    <input
                      type="text"
                      value={fuelNorms[dispatchId] ?? a.fuelAmount ?? ""}
                      onChange={(e) =>
                        setFuelNorms((prev) => ({ ...prev, [dispatchId]: e.target.value }))
                      }
                      onBlur={async () => {
                        const value = fuelNorms[dispatchId]
                        try {
                          await releasePlanService.updateSolarium(dispatchId, value)
                        } catch (error) {
                          console.error("Ошибка при обновлении солярки:", error)
                        }
                      }}
                      className="w-16 text-center text-red-600 font-semibold border border-red-300 rounded px-1 py-[2px] outline-none focus:ring-1 focus:ring-red-400"
                      placeholder="—"
                    />
                  </td>
                  <td className={cellClass}>
                    <div>{formatTimeHHMM(a.departureTime)}</div>
                    {a.releasedTime && a.releasedTime !== "00:00:00" && (
                      <div className="text-[11px] text-green-600 mt-0.5">
                      {a.releasedTime.slice(0, 5)} — путевой лист
                    </div>
                    )}
                  </td>
                  <td className={cellClass}>{a.scheduleTime}</td>
                  <td className={cellClass}>
                    <AssignmentCell assignment={a} date={displayDate} readOnly={readOnly} />
                  </td>
                  <td className={cellClass}>{formatTimeHHMM(a.endTime)}</td>
                  <td className={cellClass}>{isChecked ? "✅ Вышел" : "—"}</td>
                  <td className={cellClass}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-gray-100" title="Действия">
                          <MoreHorizontal className="h-5 w-5 text-gray-600" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onReplaceClick(a, handleReplaceSuccess)}
                          className="cursor-pointer"
                        >
                          🔁 Заменить
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCheckboxChange(a, !isChecked)}
                          className="cursor-pointer"
                        >
                          {isChecked ? "❎ Отменить выход" : "✅ Отметить как вышедший"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}