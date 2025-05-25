"use client"

import { InfoCell } from "./InfoCell"
import type { FinalDispatchData } from "@/types/releasePlanTypes"
import { Wrench } from "lucide-react"
import { formatDayOfWeek, getMonthName } from "../utils/dateUtils"
import Link from "next/link"
import { useState } from "react"

interface FinalDispatchTableProps {
  data: FinalDispatchData
  depotNumber?: number
  driversCount: number
  busesCount: number
  convoySummary?: {
    totalDrivers?: number
    totalBuses?: number
    driverOnWork?: number
    busOnWork?: number
  }
  dayType: string
}

export default function FinalDispatchTable({
  data,
  depotNumber,
  driversCount,
  busesCount,
  convoySummary,
  dayType,
}: FinalDispatchTableProps) {
  const {
    routeGroups = [],
    reserveAssignments = [],
    repairBuses = [],
    dayOffBuses = [],
    driverStatuses = {},
    date,
  } = data

  const displayDate = new Date(date)
  const [showDayOffBuses, setShowDayOffBuses] = useState(false)
  const [showDayOffDrivers, setShowDayOffDrivers] = useState(false)


  function formatShortName(fullName?: string, serviceNumber?: string) {
    if (!fullName) return "—"
    const [last, first = "", middle = ""] = fullName.split(" ")
    const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
    const nameShort = `${last} ${initials}`
    return serviceNumber ? `${nameShort} (№ ${serviceNumber})` : nameShort
  }
  
  return (
    <div className="text-[18px] leading-relaxed space-y-2 text-gray-900">
      {/* 🧾 Верхняя панель */}
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

      {/* 📋 Таблицы маршрутов */}
      {routeGroups.map((group) => (
        <div key={group.routeId}>
          <Link
            href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/route/${group.routeId}?from=final-dispatch`}
            className="block bg-sky-600 text-white font-bold text-sm px-3 py-2 rounded-t mt-3 shadow-sm tracking-wide hover:bg-sky-700 transition"
          >
            🚌 Маршрут № {group.routeNumber}
          </Link>

          <table className="w-full border text-sm">
            <thead className="bg-sky-100 text-sky-900">
              <tr>
                <th className="p-2 border">№</th>
                <th className="p-2 border">Гар. номер</th>
                <th className="p-2 border">Гос. номер</th>
                <th className="p-2 border">ФИО</th>
                <th className="p-2 border">Таб. номер</th>
                <th className="p-2 border">Время выхода</th>
                <th className="p-2 border">По графику</th>
                <th className="p-2 border">Доп. информация</th>
                <th className="p-2 border">Пересменка</th>
                <th className="p-2 border">ФИО</th>
                <th className="p-2 border">Таб. номер</th>
                <th className="p-2 border">Конец</th>
              </tr>
            </thead>
            <tbody>
            {[...group.assignments]
              .sort((a, b) => parseInt(a.busLineNumber) - parseInt(b.busLineNumber))
              .map((a, i) => (
                <tr key={i} className="even:bg-gray-50 font-medium">
                  <td className="border p-1 text-center">{a.busLineNumber ?? "—"}</td>
                  <td className="border p-1">{a.garageNumber}</td>
                  <td className="border p-1">{a.stateNumber}</td>
                  <td className="border p-1">{a.driver?.fullName ?? "—"}</td>
                  <td className="border p-1 text-center">{a.driver?.serviceNumber ?? "—"}</td>
                  <td className="border p-1">{a.departureTime}</td>
                  <td className="border p-1">{a.scheduleTime}</td>
                  <td className="border p-1">
                    <InfoCell
                      initialValue={a.additionalInfo ?? ""}
                      dispatchBusLineId={a.dispatchBusLineId}
                      date={displayDate}
                    />
                  </td>
                  <td className="border p-1">{a.shift2AdditionalInfo ?? "—"}</td>
                  <td className="border p-1">{a.shift2Driver?.fullName ?? "—"}</td>
                  <td className="border p-1 text-center">{a.shift2Driver?.serviceNumber ?? "—"}</td>
                  <td className="border p-1">{a.endTime}</td>
                </tr>
              ))}
          </tbody>
          </table>
        </div>
      ))}

      {/* 🟨 Резерв */}
      {reserveAssignments.length > 0 && (
        <>
          <div className="bg-yellow-400 text-black font-bold text-sm px-3 py-2 rounded-t mt-3 shadow-sm tracking-wide">
            🟨 Резерв
          </div>
          <table className="w-full border text-sm">
            <thead className="bg-yellow-100 text-black">
              <tr>
                <th className="p-2 border">№</th>
                <th className="p-2 border">Гар. номер</th>
                <th className="p-2 border">Гос. номер</th>
                <th className="p-2 border">ФИО</th>
                <th className="p-2 border">Таб. номер</th>
                <th className="p-2 border">Время выхода</th>
                <th className="p-2 border">По графику</th>
                <th className="p-2 border">Доп. информация</th>
                <th className="p-2 border">Пересменка</th>
                <th className="p-2 border">ФИО</th>
                <th className="p-2 border">Таб. номер</th>
                <th className="p-2 border">Конец</th>
              </tr>
            </thead>
            <tbody>
              {reserveAssignments.map((r, i) => (
                <tr key={i} className="even:bg-gray-50 font-medium">
                  <td className="border p-1 text-center">{r.sequenceNumber || i + 1}</td>
                  <td className="border p-1">{r.garageNumber || "—"}</td>
                  <td className="border p-1">{r.stateNumber || "—"}</td>
                  <td className="border p-1">{r.driver?.fullName || "—"}</td>
                  <td className="border p-1 text-center">{r.driver?.serviceNumber || "—"}</td>
                  <td className="border p-1">—</td>
                  <td className="border p-1">—</td>
                  <td className="border p-1">
                    <InfoCell
                      initialValue={r.additionalInfo ?? ""}
                      dispatchBusLineId={r.dispatchBusLineId}
                      date={displayDate}
                    />
                  </td>
                  <td className="border p-1">—</td>
                  <td className="border p-1">{r.shift2Driver?.fullName || "—"}</td>
                  <td className="border p-1">{r.shift2Driver?.serviceNumber || "—"}</td>
                  <td className="border p-1">{r.endTime || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
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
                <span key={i} className="px-3 py-1 bg-white rounded border text-sm shadow-sm">{b}</span>
              )) : <span className="text-gray-400">—</span>}
            </div>
          </div>

          {/* 🚫 На выходном */}
          <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
            <h4 className="font-bold text-red-700 mb-3 flex items-center justify-between gap-2">
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
              <div className="flex flex-wrap gap-2">
                {dayOffBuses.map((b, i) => (
                  <span key={i} className="px-3 py-1 bg-white rounded border text-sm shadow-sm">{b}</span>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Назначено */}
          <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
            <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
              <span className="text-xl">📊</span> Назначено
            </h4>
            <ul className="text-sm text-gray-800 space-y-1">
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
        formatShortName,
        showDayOffDrivers,
        () => setShowDayOffDrivers(!showDayOffDrivers)
      )}
        {renderDriverStatusTable(
          "🤒 Больничный",
          driverStatuses?.OnSickLeave,
          formatShortName,
          true,              // всегда показывать
          () => {}           // заглушка, не нужна кнопка
        )}

        {renderDriverStatusTable(
          "🏖️ Отпуск",
          driverStatuses?.OnVacation,
          formatShortName,
          true,
          () => {}
        )}

        {renderDriverStatusTable(
          "🧪 Стажёры",
          driverStatuses?.Intern,
          formatShortName,
          true,
          () => {}
        )}
        </div>
      </div>
    )
  }

  function renderDriverStatusTable(
    title: string,
    list: string[] | undefined,
    formatShortName: (name?: string) => string,
    show: boolean = true,
    toggleShow: () => void = () => {},
    colorClass = "text-gray-700"
  ) {
  return (
    <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
      <h4 className={`font-bold mb-3 flex items-center justify-between ${colorClass}`}>
        <span className="flex items-center gap-2">
          {title} <span className="text-sm text-gray-500">({list?.length ?? 0})</span>
        </span>
        {list?.length ? (
          <button
            onClick={toggleShow}
            className="text-sm text-blue-600 hover:underline"
          >
            {show ? "Скрыть" : "Показать"}
          </button>
        ) : null}
      </h4>
      {show && (
      <table className="w-full border text-sm text-gray-900">
        <tbody>
          <tr className="flex flex-wrap gap-2">
            {list?.map((fullName, i) => (
              <td key={i} className="border px-2 py-1 bg-white shadow-sm">
                {formatShortName(fullName)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    )}

    {!show && <div className="text-sm text-gray-400">Скрыто</div>}
    </div>
  )
}
