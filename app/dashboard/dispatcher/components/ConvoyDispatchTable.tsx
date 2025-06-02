"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Wrench } from "lucide-react"
import type { FinalDispatchData, ValidDayType } from "@/types/releasePlanTypes"
import type { Driver } from "@/types/driver.types"
import { InfoCell } from "../../fleet-manager/release-plan/components/InfoCell"
import { formatDayOfWeek, getMonthName } from "../convoy/[id]/release-plan/utils/dateUtils"
import ViewDriverDialog from "@/app/dashboard/fleet-manager/drivers/components/ViewDriverDialog"
import { driverService } from "@/service/driverService"
import { BusFront,Users  } from "lucide-react"


interface ConvoyDispatchTableProps {
  data: FinalDispatchData
  driversCount: number
  busesCount: number
  convoySummary?: {
    totalDrivers?: number
    totalBuses?: number
    driverOnWork?: number
    busOnWork?: number
  }
  depotNumber?: number
  date?: string
  dayType?: ValidDayType
  readOnlyMode?: boolean
}

export default function ConvoyDispatchTable({
  data,
  driversCount,
  busesCount,
  convoySummary,
  depotNumber,
  date,
  dayType,
  readOnlyMode = false,
}: ConvoyDispatchTableProps) {
  const router = useRouter()
  const displayDate = new Date(data.date)
  const routeGroups = data.routeGroups ?? []
  const reserveAssignments = data.reserveAssignments ?? []
  const repairBuses = data.repairBuses ?? []
  const dayOffBuses = data.dayOffBuses ?? []
  const driverStatuses = data.driverStatuses ?? {}
  const [fuelNorms, setFuelNorms] = useState<Record<string, string>>({})
  const [checkedDepartures, setCheckedDepartures] = useState<Record<string, boolean>>({})


  const [showDayOffBuses, setShowDayOffBuses] = useState(false)
  const [showDayOffDrivers, setShowDayOffDrivers] = useState(true)

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleDriverClick = async (driver: { id: string } | null) => {
    if (!driver?.id) return
  
    try {
      const response = await driverService.getById(driver.id)
      if (response.isSuccess && response.value) {
        setSelectedDriver(response.value)
        setDialogOpen(true)
      }
    } catch (error) {
      console.error("Ошибка загрузки водителя:", error)
    }
  }  

  const handleReplaceClick = (a: any) => {
    console.log("Заменить:", a)
    // open replace modal here
  }

  const handleRemoveClick = (a: any) => {
    console.log("Снять:", a)
    // open remove modal here
  }
  
  const formatShortName = (fullName?: string) => {
    if (!fullName) return "—"
    const [last, first = "", middle = ""] = fullName.split(" ")
    const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
    return `${last} ${initials}`
  }

  const renderDriverStatusTable = (
    title: string,
    list: string[] | undefined,
    date: string,
    show: boolean = true,
    toggleShow: () => void = () => {},
    colorClass = "text-gray-700",
    statusKey?: "OnSickLeave" | "OnVacation" | "Intern"
  ) => {
    const displayDate = new Date(date)

    const goToDriversPage = () => {
      const baseUrl = "/dashboard/fleet-manager/drivers"
      const url = statusKey
        ? `${baseUrl}?status=${statusKey}&date=${date}`
        : `${baseUrl}?date=${date}`
      router.push(url)
    }

  

    return (
      <div
        className={`bg-gray-50 border rounded-lg p-3 shadow-sm ${
          statusKey ? "hover:bg-gray-100 cursor-pointer" : ""
        }`}
        onClick={goToDriversPage}
      >
        <h4 className={`font-bold mb-2 flex items-center justify-between ${colorClass}`}>
          <span className="flex items-center gap-2">
            {title} <span className="text-sm text-gray-500">({list?.length ?? 0})</span>
          </span>
          {list?.length && !statusKey ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleShow()
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {show ? "Скрыть" : "Показать"}
            </button>
          ) : null}
        </h4>

        {show && (
          <div className="max-h-[200px] overflow-y-auto">
            <table className="w-full border text-sm text-gray-900">
              <tbody>
                <tr className="flex flex-wrap gap-2">
                  {list
                    ?.slice()
                    .sort((a, b) => a.localeCompare(b))
                    .map((fullName, i) => (
                      <td
                        key={i}
                        className="border px-2 py-0.5 bg-white shadow-sm font-semibold"
                      >
                        {formatShortName(fullName)}
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {!show && !statusKey && <div className="text-sm text-gray-400">Скрыто</div>}
      </div>
    )
  }

  return (
    <div className="text-[18px] leading-relaxed space-y-1 text-gray-900">
      <div className="flex justify-between border px-6 py-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="space-y-1">
          <div><span className="font-semibold">Водителей в колонне:</span> {convoySummary?.totalDrivers ?? driversCount}</div>
          <div><span className="font-semibold">Автобусов в колонне:</span> {convoySummary?.totalBuses ?? busesCount}</div>
          <div><span className="font-semibold">Привл. автобусов:</span> 0</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-lg tracking-wide">
            План выпуска · Колонна №{depotNumber ?? "—"} ({formatDayOfWeek(displayDate)})
          </div>
          <div className="text-sm text-gray-600">
            на {displayDate.toLocaleDateString("ru-RU")} {getMonthName(displayDate)}
          </div>
        </div>
      </div>
      {/* Таблицы маршрутов */}
      {routeGroups.map((group) => (
        <div
        key={group.routeId}
        className="mt-2 border rounded-lg shadow-md overflow-hidden bg-white"
      >
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
                    {group.assignments.some(a => a.shift2Driver) && (
                        <>
                            <th className="p-2 border">Пересменка</th>
                            <th className="p-2 border">ФИО</th>
                            <th className="p-2 border">Таб. номер</th>
                        </>
                        )}
                  <th className="p-2 border">Конец</th>
                  <th className="p-2 border text-center">Действия</th>
                </tr>
              </thead>
              <tbody>
                {[...group.assignments]
                    .sort((a, b) => parseInt(a.busLineNumber) - parseInt(b.busLineNumber))
                    .map((a, i) => (
                    <tr key={i} className="even:bg-gray-50 font-medium">
                        <td className="px-1 py-[2px] border font-semibold text-center">{a.busLineNumber ?? "—"}</td>
                        <td className="px-1 py-[2px] border font-semibold">{a.garageNumber}</td>
                        <td className="px-1 py-[2px] border font-semibold">{a.stateNumber}</td>
                        <td className="px-1 py-[2px] border font-semibold">{formatShortName(a.driver?.fullName ?? "—")}</td>
                        <td
                            className="px-1 py-[2px] border font-semibold text-center text-black-600 hover:underline cursor-pointer"
                            onClick={() => handleDriverClick(a.driver)}
                            >
                            {a.driver?.serviceNumber ?? "—"}
                        </td>
                        <td className="px-1 py-[2px] border text-center">
                        <input
                            type="text"
                            value={fuelNorms[a.dispatchBusLineId] ?? ""}
                            onChange={(e) =>
                            setFuelNorms((prev) => ({
                                ...prev,
                                [a.dispatchBusLineId]: e.target.value,
                            }))
                            }
                            className="w-16 text-center text-red-600 font-semibold border border-red-300 rounded px-1 py-[2px] outline-none focus:ring-1 focus:ring-red-400"
                            placeholder="—"
                        />
                        </td>
                        <td className="px-1 py-[2px] border font-semibold text-center">{a.departureTime}</td>
                        <td className="px-1 py-[2px] border font-semibold text-center">{a.scheduleTime}</td>
                        <td className="px-1 py-[2px] border font-semibold">
                        <InfoCell
                            initialValue={a.additionalInfo ?? ""}
                            assignmentId={a.dispatchBusLineId}
                            date={displayDate}
                            type="route"
                            busId={null}
                            driverId={null}
                            textClassName="text-red-600 font-semibold"
                            readOnly={readOnlyMode}
                        />
                        </td>
                        {a.shift2Driver && <td className="px-1 py-[2px] border font-semibold">{a.shift2AdditionalInfo ?? "—"}</td>}
                        {a.shift2Driver && <td className="px-1 py-[2px] border font-semibold">{formatShortName(a.shift2Driver?.fullName)}</td>}
                        {a.shift2Driver && <td className="px-1 py-[2px] border font-semibold text-center">{a.shift2Driver?.serviceNumber ?? "—"}</td>}
                        <td className="px-1 py-[2px] border font-semibold">{a.endTime}</td>
                        <td className="px-1 py-[2px] border font-semibold text-center space-x-1">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                type="checkbox"
                                checked={checkedDepartures[a.dispatchBusLineId] ?? false}
                                onChange={(e) =>
                                    setCheckedDepartures((prev) => ({
                                    ...prev,
                                    [a.dispatchBusLineId]: e.target.checked,
                                    }))
                                }
                                className="accent-green-600 w-4 h-4"
                                />
                                <span className="text-xs font-medium text-gray-700">Вышел</span>
                            </label>

                            <button
                                onClick={() => handleReplaceClick(a)}
                                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded border border-blue-400"
                            >
                                Заменить
                            </button>

                            <button
                                onClick={() => handleRemoveClick(a)}
                                className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded border border-red-400"
                            >
                                Снят
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
      ))}

      {reserveAssignments.length > 0 && (
        <div className="mt-6 border rounded-lg shadow overflow-hidden bg-white">
        {/* Заголовок блока резервов */}
        <div className="w-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 px-4 py-2 flex items-center gap-3">
          <Users className="w-6 h-6 text-black" />
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
                {reserveAssignments.map((r, i) => (
                  <tr key={i} className="even:bg-gray-50 font-medium">
                    <td className="px-1 py-[2px] border font-semibold text-center">{r.sequenceNumber || i + 1}</td>
                    <td className="px-1 py-[2px] border font-semibold">{r.garageNumber || "—"}</td>
                    <td className="px-1 py-[2px] border font-semibold">{r.govNumber || "—"}</td>
                    <td className="px-1 py-[2px] border font-semibold">{formatShortName(r.driver?.fullName || "—")}</td>
                    <td className="px-1 py-[2px] border font-semibold text-center">{r.driver?.serviceNumber || "—"}</td>
                    <td className="px-1 py-[2px] border text-center">
                    <input
                        type="text"
                        value={fuelNorms[r.dispatchBusLineId ?? `fallback-${i}`] ?? ""}
                        onChange={(e) =>
                            setFuelNorms((prev) => ({
                            ...prev,
                            [r.dispatchBusLineId ?? `fallback-${i}`]: e.target.value,
                            }))
                        }
                    />
                    </td>
                    <td className="px-1 py-[2px] border font-semibold">—</td>
                    <td className="px-1 py-[2px] border font-semibold">
                      <InfoCell
                        initialValue={r.additionalInfo ?? ""}
                        assignmentId={r.dispatchBusLineId}
                        date={displayDate}
                        type="reserve"
                        busId={null}
                        driverId={null}
                        textClassName="text-red-600 font-semibold"
                        readOnly={readOnlyMode}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* 📦 Нижние блоки: адаптивные и разделённые */}
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-3 mt-3">
        {/* 🔧 Ремонт */}
        <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
          <h4 className="font-bold text-sky-700 mb-3 flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Ремонт
          </h4>
          <div className="flex flex-wrap gap-2">
            {repairBuses.length ? repairBuses.map((b, i) => (
              <span key={i} className="px-2 py-0.5 bg-white rounded border text-sm shadow-sm font-semibold">{b}</span>
            )) : <span className="text-gray-400">—</span>}
          </div>
        </div>

        {/* 🚫 На выходном */}
        <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
          <h4 className="font-bold text-red-700 mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="text-xl">🚫</span> Автобусы на выходном
              <span className="text-sm text-gray-500">({dayOffBuses.length})</span>
            </span>
            {dayOffBuses.length > 0 && (
              <button
                onClick={() => setShowDayOffBuses(!showDayOffBuses)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showDayOffBuses ? "Скрыть" : "Показать"}
              </button>
            )}
          </h4>

          {showDayOffBuses && (
            <div className="flex flex-wrap gap-1">
              {dayOffBuses.map((b, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-white rounded border text-sm shadow-sm font-semibold"
                >
                  {b}
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
          <ul className="text-sm text-gray-800 space-y-1 font-semibold leading-tight">
            <li>• Водителей: {convoySummary?.driverOnWork ?? "—"}</li>
            <li>• Автобусов: {convoySummary?.busOnWork ?? "—"}</li>
          </ul>
        </div>
      </div>

      {/* Driver statuses в табличной форме */}
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-3 mt-3">
      {renderDriverStatusTable(
        "👤 Водители на выходном",
        driverStatuses?.DayOff,
        date!,
        showDayOffDrivers,
        () => setShowDayOffDrivers(!showDayOffDrivers),
        "text-red-700"
        )}
        {renderDriverStatusTable(
        "🤒 Больничный",
        driverStatuses?.OnSickLeave,
        date!,
        true,
        () => {},
        "text-orange-700",
        "OnSickLeave"
        )}
        {renderDriverStatusTable(
        "🏖️ Отпуск",
        driverStatuses?.OnVacation,
        date!,
        true,
        () => {},
        "text-yellow-700",
        "OnVacation"
        )}
        {renderDriverStatusTable(
        "🧪 Стажёры",
        driverStatuses?.Intern,
        date!,
        true,
        () => {},
        "text-cyan-700",
        "Intern"
        )}
      </div>
      <ViewDriverDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        driver={selectedDriver}
        />
    </div>
  )
}
