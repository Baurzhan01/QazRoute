"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal } from "lucide-react"
import AssignmentCell from "./AssignmentCell"
import { releasePlanService } from "@/service/releasePlanService"
import { useConvoy } from "../context/ConvoyContext"
import { formatShortName } from "../convoy/[id]/release-plan/utils/driverUtils"
import type { RouteAssignment, RouteGroup } from "@/types/releasePlanTypes"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"
import ReferenceDialog from "../components/references/ReferenceDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "../convoy/[id]/release-plan/utils/dateUtils"

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

  // Справки: модалка и целевое обновление строки
  const [refOpen, setRefOpen] = useState(false)
  const [refAssignment, setRefAssignment] = useState<RouteAssignment | null>(null)
  const [refsBump, setRefsBump] = useState<Record<string, number>>({})

  const openReference = (a: RouteAssignment) => {
    // гарантируем, что в модалку попадёт routeNumber
    setRefAssignment({ ...a, routeNumber: (a as any).routeNumber ?? group.routeNumber })
    setRefOpen(true)
  }

  useEffect(() => {
    setAssignments(group.assignments)
  }, [group.assignments])

  const handleReplaceSuccess = (
    updated: RouteAssignment & {
      oldBus?: { garageNumber?: string; stateNumber?: string }
      oldDriver?: { fullName?: string }
      replacementType?: string
    }
  ) => {
    const isPermutation = updated.replacementType === "Permutation"
    const isRearrangingRoute = updated.replacementType === "RearrangingRoute"

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
              description: updated.description ?? a.description,
              additionalInfo: isPermutation
                ? "🔁 Перестановка с маршрута"
                : isRearrangingRoute
                ? "🔄 Перестановка по маршруту"
                : updated.additionalInfo ?? a.additionalInfo,
            }
          : a
      )
    )

    onReplaceSuccess?.(updated)
  }

  const handleInfoFromHistory = (dispatchId: string, updatedValue: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.dispatchBusLineId === dispatchId ? { ...a, additionalInfo: updatedValue } : a
      )
    )
  }

  // Выдача/возврат ПЛ: меняем только isRealsed + releasedTime
  const handleCheckboxChange = async (assignment: RouteAssignment, checked: boolean) => {
    const dispatchId = assignment.dispatchBusLineId
    const currentStatus = assignment.status

    const newIsRealsed = checked
    const newReleasedTime = checked
      ? new Date().toLocaleTimeString("ru-RU", { hour12: false }).slice(0, 5) + ":00"
      : ""

    setCheckedDepartures((prev) => ({ ...prev, [dispatchId]: checked }))

    try {
      await releasePlanService.updateDispatchStatus(dispatchId, Number(currentStatus), newIsRealsed)

      setAssignments((prev) =>
        prev.map((a) =>
          a.dispatchBusLineId === dispatchId
            ? {
                ...a,
                isRealsed: newIsRealsed,
                releasedTime: newReleasedTime,
              }
            : a
        )
      )
    } catch (err) {
      console.error("Ошибка обновления ПЛ:", err)
      setCheckedDepartures((prev) => ({ ...prev, [dispatchId]: !checked }))
    }
  }

  const formatTimeHHMM = (time?: string) => {
    return time?.length === 8 ? time.slice(0, 5) : time || "—"
  }

  const headerClass =
    "p-2 border text-center bg-sky-100 text-sky-900 text-sm font-semibold"
  const cellClass = "p-2 border text-center text-sm"

  return (
    <>
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
                const isRearrangingRoute = a.status === DispatchBusLineStatus.RearrangingRoute
                const isReleased = a.status === DispatchBusLineStatus.Released
                const isGarageLaunch = a.status === DispatchBusLineStatus.LaunchedFromGarage
                const isHistory = a.additionalInfo?.includes("Автобус выехал на линию")

                const rowColor = isHistory
                  ? "bg-green-50"
                  : isReplaced
                  ? "bg-yellow-50"
                  : isPermutation || isRearrangingRoute
                  ? "bg-blue-50"
                  : isReleased
                  ? "bg-green-50"
                  : isGarageLaunch
                  ? "bg-red-50"
                  : ""

                return (
                  <tr key={dispatchId} className={rowColor}>
                    {showRouteNumber ? (
                      <td
                        className="p-2 border text-center text-sm font-bold align-middle bg-[#e0f2fe] special-route-bg"
                        rowSpan={assignments.length}
                        style={{ minWidth: "120px", verticalAlign: "middle" }}
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
                    <td className={cellClass}>
                      <AssignmentCell
                        key={`${a.dispatchBusLineId}-${(refsBump[a.dispatchBusLineId] ?? 0)}`}
                        assignment={a}
                        date={displayDate}
                        readOnly={readOnly}
                        onUpdateLocalValue={(text) => handleInfoFromHistory(a.dispatchBusLineId, text)}
                        refsVersion={refsBump[a.dispatchBusLineId] ?? 0}
                      />
                    </td>
                    <td className={cellClass}>{formatTimeHHMM(a.endTime)}</td>
                    <td className={cellClass}>{isChecked ? "✅" : "—"}</td>
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
                            {isChecked ? "❎ Вернул ПЛ" : "✅ Выдать ПЛ"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openReference(a)}
                            className="cursor-pointer"
                          >
                            🧾 Справка
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

      {/* Единственная модалка "Справка" вне map */}
      <ReferenceDialog
        open={refOpen}
        onOpenChange={(open) => {
          setRefOpen(open)
          if (!open) setRefAssignment(null)
        }}
        assignment={refAssignment}
        displayDate={displayDate}           // ⬅️ передаём дату в модалку
        onCreated={(_, textForDescription) => {
          // 1) локально обновим только нужную строку, чтобы сразу показать запись
          if (refAssignment) {
            const id = refAssignment.dispatchBusLineId
            setAssignments(prev =>
              prev.map(a =>
                a.dispatchBusLineId === id ? { ...a, additionalInfo: textForDescription } : a
              )
            )
            // форс-рендер ячейки (если где-то используешь версионирование)
            setRefsBump(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
          }

          // 2) опционально — подтянуть всё с бэка (если родитель пробросил refetch)
          onReload?.()
        }}
      />
    </>
  )
}
