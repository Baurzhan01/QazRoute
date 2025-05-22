"use client"

import { InfoCell } from "./InfoCell"
import type { FinalDispatchData } from "@/types/releasePlanTypes"
import { Wrench } from "lucide-react"
import { formatDayOfWeek, getMonthName } from "../utils/dateUtils"
import Link from "next/link"

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
  dayType: string //
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

  function formatDriverName(fullName?: string, serviceNumber?: string) {
    if (!fullName) return "—"
    const [last, first = "", middle = ""] = fullName.split(" ")
    const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
    const nameShort = `${last} ${initials}`
    return serviceNumber ? `${nameShort} (№ ${serviceNumber})` : nameShort
  }

  return (
    <div className="text-[15px] leading-relaxed space-y-8 text-gray-900">
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
            className="block bg-sky-600 text-white font-bold text-sm px-3 py-2 rounded-t mt-6 shadow-sm tracking-wide hover:bg-sky-700 transition"
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
          <div className="bg-yellow-400 text-black font-bold text-sm px-3 py-2 rounded-t mt-6 shadow-sm tracking-wide">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-4 rounded-lg shadow-md border divide-y md:divide-y-0 md:divide-x">
        <div className="md:pr-4">
          <h4 className="font-bold flex items-center gap-2 text-sky-700 mb-2">
            <Wrench className="h-5 w-5" /> Ремонт
          </h4>
          <ul className="grid [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))] gap-2 text-sm font-medium text-gray-800">
            {repairBuses.length ? repairBuses.map((b, i) => <li key={i}>{b}</li>) : <li>—</li>}
          </ul>
        </div>
        <div className="md:px-4 pt-4 md:pt-0">
          <h4 className="font-bold text-red-700 mb-2">🚫 Автобусы на выходном</h4>
          <ul className="grid [grid-template-columns:repeat(auto-fit,minmax(100px,1fr))] gap-2 text-sm font-medium text-gray-800">
            {dayOffBuses.length ? dayOffBuses.map((b, i) => <li key={i}>{b}</li>) : <li>—</li>}
          </ul>
        </div>
        <div className="md:pl-4 pt-4 md:pt-0">
          <h4 className="font-bold text-green-700 mb-2">📊 Назначено</h4>
          <ul className="text-sm font-medium text-gray-800 space-y-1 pl-1">
            <li>• Водителей: {convoySummary?.driverOnWork ?? "—"}</li>
            <li>• Автобусов: {convoySummary?.busOnWork ?? "—"}</li>
          </ul>
        </div>
      </div>

      {/* Driver statuses */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4">
        {renderStatusBlock("📁 Выходной", driverStatuses?.DayOff, "text-red-600", true)}
        {renderStatusBlock("🤒 Больничный", driverStatuses?.OnSickLeave, "text-orange-600")}
        {renderStatusBlock("🏖️ Отпуск", driverStatuses?.OnVacation, "text-yellow-600")}
        {renderStatusBlock("🧪 Стажёры", driverStatuses?.Intern, "text-blue-600")}
      </div>
    </div>
  )
}

function renderStatusBlock(title: string, list?: string[], colorClass = "text-gray-700", wide = false) {
  return (
    <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
      <h4 className={`font-bold mb-3 ${colorClass}`}>{title}</h4>
      <ul className={`grid [grid-template-columns:repeat(auto-fit,minmax(${wide ? "90px" : "140px"},1fr))] gap-2 text-sm font-medium text-gray-900`}>
        {list?.length ? list.map((name, i) => <li key={i}>{name}</li>) : <li>—</li>}
      </ul>
    </div>
  )
}
