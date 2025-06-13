"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Wrench } from "lucide-react"

import { InfoCell } from "./InfoCell"
import type { FinalDispatchData } from "@/types/releasePlanTypes"
import { formatDayOfWeek, getMonthName } from "../utils/dateUtils"

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
  readOnlyMode?: boolean
}

function formatShortName(fullName?: string, serviceNumber?: string) {
  if (!fullName) return "—"
  const [last, first = "", middle = ""] = fullName.split(" ")
  const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
  const nameShort = `${last} ${initials}`
  return serviceNumber ? `${nameShort} (№ ${serviceNumber})` : nameShort
}

function AssignmentRow({ a, i, readOnlyMode, displayDate }: any) {
  return (
    <tr key={i} className="even:bg-gray-50 font-medium text-xl">
      <td className="border px-1 text-center">{a.busLineNumber ?? "—"}</td>
      <td className="border px-1">{a.garageNumber}</td>
      <td className="border px-1">{a.stateNumber}</td>
      <td className="border px-1">{formatShortName(a.driver?.fullName)}</td>
      <td className="border px-1 text-center">{a.driver?.serviceNumber ?? "—"}</td>
      <td className="border px-1 text-center">{a.departureTime}</td>
      <td className="border px-1">
        <InfoCell
          initialValue={a.additionalInfo ?? ""}
          assignmentId={a.dispatchBusLineId}
          date={displayDate}
          type="route"
          busId={null}
          driverId={null}
          textClassName="text-red-600 font-semibold text-sm"
          readOnly={readOnlyMode}
        />
      </td>
      {a.shift2Driver && <td className="border px-1">{a.shift2AdditionalInfo ?? "—"}</td>}
      {a.shift2Driver && <td className="border px-1">{formatShortName(a.shift2Driver?.fullName)}</td>}
      {a.shift2Driver && <td className="border px-1 text-center">{a.shift2Driver?.serviceNumber ?? "—"}</td>}
      <td className="border px-1">{a.endTime}</td>
    </tr>
  )
}

function ReserveRow({ r, i, readOnlyMode, displayDate }: any) {
  return (
    <tr key={i} className="even:bg-gray-50 font-medium text-xl">
      <td className="border px-1 text-center">{r.sequenceNumber || i + 1}</td>
      <td className="border px-1">{r.garageNumber || "—"}</td>
      <td className="border px-1">{r.govNumber || "—"}</td>
      <td className="border px-1">{formatShortName(r.driver?.fullName || "—")}</td>
      <td className="border px-1 text-center">{r.driver?.serviceNumber || "—"}</td>
      <td className="border px-1 text-center">—</td>
      <td className="border px-1">
        <InfoCell
          initialValue={r.additionalInfo ?? ""}
          assignmentId={r.id} // ✅ именно r.id
          date={displayDate}
          type="reserve"
          busId={r.busId ?? null}
          driverId={r.driver?.id ?? null}
          textClassName="text-red-600 font-semibold text-sm"
          readOnly={readOnlyMode}
        />
      </td>
    </tr>
  );
}

function StatusBlock({ title, list, show, toggleShow, colorClass, statusKey, date }: any) {
  const router = useRouter()
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
        {list?.length && !statusKey && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleShow()
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            {show ? "Скрыть" : "Показать"}
          </button>
        )}
      </h4>

      {show && list?.length ? (
        <table className="w-full border text-sm text-gray-900">
          <tbody>
            <tr className="flex flex-wrap gap-2">
              {list.map((fullName: string, i: number) => (
                <td key={i} className="border px-2 py-0.5 bg-white shadow-sm font-semibold">
                  {formatShortName(fullName)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      ) : !statusKey && <div className="text-sm text-gray-400">Скрыто</div>}
    </div>
  )
}

export default function FinalDispatchTable({
  data,
  depotNumber,
  driversCount,
  busesCount,
  convoySummary,
  dayType,
  readOnlyMode = false,
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
  const [showDayOffBuses, setShowDayOffBuses] = useState(true)
  const [showDayOffDrivers, setShowDayOffDrivers] = useState(true)

  return (
    <div className="text-[18px] leading-relaxed space-y-1 text-gray-900">
      {/* Верхняя панель */}
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
        <div key={group.routeId} className="flex mt-6 rounded shadow border overflow-hidden">
          <Link
            href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/route/${group.routeId}?from=final-dispatch`}
            className="bg-sky-100 text-black flex flex-col items-center justify-center px-6 py-2 min-w-[110px] hover:bg-sky-200 transition"
          >
            <div className="text-5xl font-extrabold leading-none">{group.routeNumber}</div>
            <div className="text-base font-semibold mt-1 tracking-wide uppercase text-gray-800">Маршрут</div>
          </Link>

          <div className="flex-1">
            <table className="w-full border text-sm">
              <thead className="bg-sky-100 text-sky-900">
                <tr>
                  <th className="border px-1 text-xl">№</th>
                  <th className="border px-1 text-xl">Гар. номер</th>
                  <th className="border px-1 text-xl">Гос. номер</th>
                  <th className="border px-1 text-xl">ФИО</th>
                  <th className="border px-1 text-xl">Таб. номер</th>
                  <th className="border px-1 text-xl">Время выхода</th>
                  <th className="border px-2 text-xl w-[380px]">Доп. информация</th>
                  {group.assignments.some(a => a.shift2Driver) && (
                    <>
                      <th className="border px-1 text-xl">Пересменка</th>
                      <th className="border px-1 text-xl">ФИО</th>
                      <th className="border px-1 text-xl">Таб. номер</th>
                    </>
                  )}
                  <th className="border px-1 text-xl">Конец</th>
                </tr>
              </thead>
              <tbody>
                {[...group.assignments]
                  .sort((a, b) => Number(a.busLineNumber) - Number(b.busLineNumber))
                  .map((a, i) => (
                    <AssignmentRow key={i} a={a} i={i} readOnlyMode={readOnlyMode} displayDate={displayDate} />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Резерв */}
      {reserveAssignments.length > 0 && (
        <div className="flex mt-6 rounded shadow border overflow-hidden">
          <Link
            href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/reserve?from=final-dispatch`}
            className="bg-yellow-400 text-black flex flex-col items-center justify-center px-6 py-2 min-w-[110px] hover:bg-yellow-300 transition"
          >
            <div className="text-4xl font-extrabold leading-none">РЕЗЕРВ</div>
          </Link>
          <div className="flex-1">
            <table className="w-full border text-sm">
              <thead className="bg-yellow-100 text-black">
                <tr>
                  <th className="border px-1 text-xl">№</th>
                  <th className="border px-1 text-xl">Гар. номер</th>
                  <th className="border px-1 text-xl">Гос. номер</th>
                  <th className="border px-1 text-xl">ФИО</th>
                  <th className="border px-1 text-xl">Таб. номер</th>
                  <th className="border px-1 text-xl">Время выхода</th>
                  <th className="border px-1 text-xl">Доп. информация</th>
                </tr>
              </thead>
              <tbody>
                {reserveAssignments.map((r, i) => (
                  <ReserveRow key={i} r={r} i={i} readOnlyMode={readOnlyMode} displayDate={displayDate} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Блоки снизу */}
      <div className="grid gap-3 mt-3">
        {/* Ремонт */}
        <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
          <h4 className="font-bold text-sky-700 mb-3 flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Ремонт
          </h4>
          <div className="flex flex-wrap gap-2">
            {repairBuses.length > 0 ? repairBuses.map((b, i) => (
              <span key={i} className="px-2 py-0.5 bg-white rounded border text-sm shadow-sm font-semibold">{b}</span>
            )) : <span className="text-gray-400">—</span>}
          </div>
        </div>

        {/* Выходной автобусы */}
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
                <span key={i} className="px-2 py-0.5 bg-white rounded border text-sm shadow-sm font-semibold">{b}</span>
              ))}
            </div>
          )}
        </div>

        {/* Назначено */}
        <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
          <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
            <span className="text-xl">📊</span> Назначено
          </h4>
          <ul className="text-sm text-gray-800 space-y-1 font-semibold leading-tight">
            <li>• Водителей: {convoySummary?.driverOnWork ?? "—"}</li>
            <li>• Автобусов: {convoySummary?.busOnWork ?? "—"}</li>
          </ul>
        </div>

        {/* Статусы водителей */}
        {StatusBlock({ title: "👤 Водители на выходном", list: driverStatuses?.DayOff, show: showDayOffDrivers, toggleShow: () => setShowDayOffDrivers(!showDayOffDrivers), colorClass: "text-red-700", statusKey: undefined, date })}
        {StatusBlock({ title: "🤒 Больничный", list: driverStatuses?.OnSickLeave, show: true, toggleShow: () => {}, colorClass: "text-orange-700", statusKey: "OnSickLeave", date })}
        {StatusBlock({ title: "🏖️ Отпуск", list: driverStatuses?.OnVacation, show: true, toggleShow: () => {}, colorClass: "text-yellow-700", statusKey: "OnVacation", date })}
        {StatusBlock({ title: "🧪 Стажёры", list: driverStatuses?.Intern, show: true, toggleShow: () => {}, colorClass: "text-cyan-700", statusKey: "Intern", date })}
      </div>
    </div>
  )
}
