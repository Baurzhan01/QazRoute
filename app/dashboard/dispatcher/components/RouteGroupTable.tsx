// ✅ Финальный RouteGroupTable.tsx
"use client"

import { BusFront } from "lucide-react"
import { InfoCell } from "@/app/dashboard/fleet-manager/release-plan/components/InfoCell"
import { formatShortName } from "../convoy/[id]/release-plan/utils/driverUtils"
import { releasePlanService } from "@/service/releasePlanService"
import { useConvoy } from "../context/ConvoyContext"
import type { RouteGroup } from "@/types/releasePlanTypes"
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
  onReplaceClick: (assignment: any) => void
  onRemoveClick: (assignment: any) => void
  onReload?: () => void
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
}: RouteGroupTableProps) {
  const { convoyId } = useConvoy()

  return (
    <div className="mt-2 border rounded-lg shadow-md overflow-hidden bg-white">
      <div className="w-full bg-gradient-to-r from-sky-100 via-sky-200 to-sky-100 px-3 py-1.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-4">
          <BusFront className="w-8 h-8 text-sky-800" />
          <span className="text-xl font-extrabold text-sky-900 tracking-wider">
            Маршрут №{group.routeNumber}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
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
              {group.assignments.some(a => a.shift2Driver) && (
                <>
                  <th className="p-2 border">Пересменка</th>
                  <th className="p-2 border">ФИО</th>
                  <th className="p-2 border">Таб. номер</th>
                </>
              )}
              <th className="p-2 border">Конец</th>
              <th className="p-2 border">Отметка</th>
              <th className="p-2 border">Действия</th>
            </tr>
          </thead>
          <tbody>
            {[...group.assignments]
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

                return (
                  <tr key={i} className={`font-medium ${rowColor}`}>
                    <td className="border text-center">{a.busLineNumber}</td>
                    <td className="border text-center">{a.garageNumber}</td>
                    <td className="border text-center">{a.stateNumber}</td>
                    <td className="border font-semibold">
                      {formatShortName(a.driver?.fullName ?? "—")}
                      {isReplaced && <span className="ml-2 text-xs text-red-600">🔁 замена</span>}
                      {isPermutation && <span className="ml-2 text-xs text-blue-600">🔄 перест.</span>}
                    </td>
                    <td className="border text-center cursor-pointer" onClick={() => onDriverClick(a.driver)}>
                      {a.driver?.serviceNumber ?? "—"}
                    </td>
                    <td className="border text-center">
                      <input
                        value={fuelNorms[a.dispatchBusLineId] ?? ""}
                        onChange={e => setFuelNorms(prev => ({ ...prev, [a.dispatchBusLineId]: e.target.value }))}
                        onBlur={async () => {
                          try {
                            await releasePlanService.updateSolarium(
                              a.dispatchBusLineId,
                              fuelNorms[a.dispatchBusLineId]
                            )
                          } catch (error) {
                            console.error("Ошибка обновления солярки:", error)
                          }
                        }}
                        className="w-16 border rounded px-1 text-center text-red-600"
                      />
                    </td>
                    <td className="border text-center">{a.departureTime}</td>
                    <td className="border text-center">{a.scheduleTime}</td>
                    <td className="border">
                      <div className="flex flex-col">
                        <InfoCell
                          initialValue={a.additionalInfo ?? ""}
                          assignmentId={a.dispatchBusLineId}
                          date={displayDate}
                          type="route"
                          readOnly={readOnly}
                        />
                        {a.releasedTime && (
                          <span className={`text-[11px] mt-1 ${isReleased ? "text-green-600" : "text-red-600"}`}>
                            {a.releasedTime.slice(0, 5)} — путевой лист
                          </span>
                        )}
                      </div>
                    </td>
                    {a.shift2Driver && <td className="border">{a.shift2AdditionalInfo ?? "—"}</td>}
                    {a.shift2Driver && <td className="border">{formatShortName(a.shift2Driver.fullName)}</td>}
                    {a.shift2Driver && <td className="border text-center">{a.shift2Driver.serviceNumber}</td>}
                    <td className="border text-center">{a.endTime}</td>
                    <td className="border text-center text-green-800">
                      {isReleased ? "✅ Вышел" : "—"}
                    </td>
                    <td className="border text-center space-x-2">
                      <input
                        type="checkbox"
                        className="accent-green-600 w-4 h-4"
                        checked={checkedDepartures[a.dispatchBusLineId] ?? false}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setCheckedDepartures(prev => ({
                            ...prev,
                            [a.dispatchBusLineId]: checked,
                          }))
                          releasePlanService
                            .updateDispatchStatus(
                              a.dispatchBusLineId,
                              checked ? DispatchBusLineStatus.Released : DispatchBusLineStatus.Undefined
                            )
                            .then(() => onReload?.())
                            .catch(() => {
                              setCheckedDepartures(prev => ({
                                ...prev,
                                [a.dispatchBusLineId]: !checked,
                              }))
                            })
                        }}
                      />
                      <button
                        onClick={() =>
                          onReplaceClick({
                            dispatchBusLineId: a.dispatchBusLineId,
                            driverId: a.driver?.id ?? null,
                            busId: a.bus?.id ?? null,
                          })
                        }
                        className="text-xs px-2 py-1 bg-blue-100 border border-blue-400 rounded"
                      >
                        Заменить
                      </button>
                      <button
                        onClick={() => onRemoveClick(a)}
                        className="text-xs px-2 py-1 bg-red-100 border border-red-400 rounded"
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
