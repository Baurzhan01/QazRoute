"use client"

import { InfoCell } from "./InfoCell"
import type { FinalDispatchData } from "@/types/releasePlanTypes"
import { Wrench } from "lucide-react"
import { formatDayOfWeek, getMonthName } from "../utils/dateUtils"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"  // вверху файла


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
  const router = useRouter()


  function formatShortName(fullName?: string, serviceNumber?: string) {
    if (!fullName) return "—"
    const [last, first = "", middle = ""] = fullName.split(" ")
    const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
    const nameShort = `${last} ${initials}`
    return serviceNumber ? `${nameShort} (№ ${serviceNumber})` : nameShort
  }
  
  return (
    <div className="text-[18px] leading-relaxed space-y-1 text-gray-900">
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
            <div key={group.routeId} className="flex mt-6 rounded shadow border overflow-hidden">
            {/* Слева: крупный номер маршрута */}
            <Link
              href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/route/${group.routeId}?from=final-dispatch`}
              className="bg-sky-100 text-black flex flex-col items-center justify-center px-6 py-2 min-w-[110px] hover:bg-sky-200 transition"
            >
              <div className="text-5xl font-extrabold leading-none">
                {group.routeNumber}
              </div>
              <div className="text-base font-semibold mt-1 tracking-wide uppercase text-gray-800">Маршрут</div>
            </Link>
          
            {/* Справа: таблица */}
            <div className="flex-1">
              <table className="w-full border text-sm">
                <thead className="bg-sky-100 text-sky-900">
                  <tr>
                    <th className="px-1 py-[2px] border font-semibold text-center text-xl">№</th>
                    <th className="px-1 py-[2px] border font-semibold text-center text-xl">Гар. номер</th>
                    <th className="px-1 py-[2px] border font-semibold text-center text-xl">Гос. номер</th>
                    <th className="px-1 py-[2px] border font-semibold text-center text-xl">ФИО</th>
                    <th className="px-1 py-[2px] border font-semibold text-center text-xl">Таб. номер</th>
                    <th className="px-1 py-[2px] border font-semibold text-center text-xl">Время выхода</th>
                    <th className="px-1 py-[2px] border font-semibold text-center text-xl">Доп. информация</th>
                    {group.assignments.some(a => a.shift2Driver) && (
                        <>
                            <th className="px-1 py-[2px] border font-semibold text-center text-xl">Пересменка</th>
                            <th className="px-1 py-[2px] border font-semibold text-center text-xl">ФИО</th>
                            <th className="px-1 py-[2px] border font-semibold text-center text-xl">Таб. номер</th>
                        </>
                        )}
                    <th className="px-1 py-[2px] border font-semibold text-center text-xl">Конец</th>
                  </tr>
                </thead>
                <tbody>
                  {[...group.assignments]
                    .sort((a, b) => parseInt(a.busLineNumber) - parseInt(b.busLineNumber))
                    .map((a, i) => (
                      <tr key={i} className="even:bg-gray-50 font-medium text-xl">
                        <td className="px-1 py-[2px] border font-semibold text-center">{a.busLineNumber ?? "—"}</td>
                        <td className="px-1 py-[2px] border font-semibold">{a.garageNumber}</td>
                        <td className="px-1 py-[2px] border font-semibold">{a.stateNumber}</td>
                        <td className="px-1 py-[2px] border font-semibold">{formatShortName(a.driver?.fullName ?? "—")}</td>
                        <td className="px-1 py-[2px] border font-semibold text-center">{a.driver?.serviceNumber ?? "—"}</td>
                        <td className="px-1 py-[2px] border font-semibold text-center">{a.departureTime}</td>
                        <td className="px-1 py-[2px] border font-semibold">
                        <InfoCell
                          initialValue={a.additionalInfo ?? ""}
                          assignmentId={a.dispatchBusLineId}
                          date={displayDate}
                          type="route"
                          busId={null}
                          driverId={null}
                          textClassName="text-red-600 font-semibold"
                          readOnly={readOnlyMode} // ← вот здесь
                        />
                        </td>
                        {a.shift2Driver && <td className="px-1 py-[2px] border font-semibold">{a.shift2AdditionalInfo ?? "—"}</td>}
                        {a.shift2Driver && <td className="px-1 py-[2px] border font-semibold">{formatShortName(a.shift2Driver?.fullName)}</td>}
                        {a.shift2Driver && <td className="px-1 py-[2px] border font-semibold text-center">{a.shift2Driver?.serviceNumber ?? "—"}</td>}
                        <td className="px-1 py-[2px] border font-semibold">{a.endTime}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>     
      ))}

      {/* 🟨 Резерв */}
      {reserveAssignments.length > 0 && (
        <div className="flex mt-6 rounded shadow border overflow-hidden">
          {/* Слева: крупный блок РЕЗЕРВ */}
          <Link
            href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/reserve?from=final-dispatch`}
            className="bg-yellow-400 text-black flex flex-col items-center justify-center px-6 py-2 min-w-[110px] hover:bg-yellow-300 transition"
          >
            <div className="text-4xl font-extrabold leading-none">РЕЗЕРВ</div>
          </Link>

          {/* Справа: таблица */}
          <div className="flex-1">
            <table className="w-full border text-sm">
            <thead className="bg-yellow-100 text-black">
                <tr>
                <th className="px-1 py-[2px] border font-semibold text-center text-xl">№</th>
                <th className="px-1 py-[2px] border font-semibold text-center text-xl">Гар. номер</th>
                <th className="px-1 py-[2px] border font-semibold text-center text-xl">Гос. номер</th>
                <th className="px-1 py-[2px] border font-semibold text-center text-xl">ФИО</th>
                <th className="px-1 py-[2px] border font-semibold text-center text-xl">Таб. номер</th>
                <th className="px-1 py-[2px] border font-semibold text-center text-xl">Время выхода</th>
                <th className="px-1 py-[2px] border font-semibold text-center text-xl">Доп. информация</th>
                </tr>
              </thead>
              <tbody>
                {reserveAssignments.map((r, i) => (
                  <tr key={i} className="even:bg-gray-50 font-medium text-xl">
                    <td className="px-1 py-[2px] border font-semibold text-center">{r.sequenceNumber || i + 1}</td>
                    <td className="px-1 py-[2px] border font-semibold">{r.garageNumber || "—"}</td>
                    <td className="px-1 py-[2px] border font-semibold">{r.govNumber || "—"}</td>
                    <td className="px-1 py-[2px] border font-semibold">{formatShortName(r.driver?.fullName || "—")}</td>
                    <td className="px-1 py-[2px] border font-semibold text-center">{r.driver?.serviceNumber || "—"}</td>
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
        formatShortName,
        date,
        showDayOffDrivers,
        () => setShowDayOffDrivers(!showDayOffDrivers),
        "text-red-700",
        undefined
      )}
        {renderDriverStatusTable(
          "🤒 Больничный",
          driverStatuses?.OnSickLeave,
          formatShortName,
          date,
          true,
          () => {},
          "text-orange-700",
          "OnSickLeave"
        )}

        {renderDriverStatusTable(
          "🏖️ Отпуск",
          driverStatuses?.OnVacation,
          formatShortName,
          date,
          true,
          () => {},
          "text-yellow-700",
          "OnVacation"
        )}

        {renderDriverStatusTable(
          "🧪 Стажёры",
          driverStatuses?.Intern,
          formatShortName,
          date,
          true,
          () => {},
          "text-cyan-700",
          "Intern"
        )}
        </div>
      </div>
    )
  }

  function renderDriverStatusTable(
    title: string,
    list: string[] | undefined,
    formatShortName: (name?: string) => string,
    date: string,
    show: boolean = true,
    toggleShow: () => void = () => {},
    colorClass = "text-gray-700",
    statusKey?: "OnSickLeave" | "OnVacation" | "Intern"
  ) {
    const router = useRouter()
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
          <table className="w-full border text-sm text-gray-900">
            <tbody>
              <tr className="flex flex-wrap gap-2">
                {list?.map((fullName, i) => (
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
        )}
  
        {!show && !statusKey && <div className="text-sm text-gray-400">Скрыто</div>}
      </div>
    )
  }
  