"use client"

import { memo, useState, useCallback, useMemo } from "react"
import { Wrench } from "lucide-react"
import Link from "next/link"
import type { DriverStatusCount } from "@/types/driver.types"

function formatShortName(fullName?: string): string {
  if (!fullName) return "—"
  const [last, first = "", middle = ""] = fullName.split(" ")
  const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
  return `${last} ${initials}`
}

interface BottomBlocksProps {
  repairBuses: string[]
  dayOffBuses: string[]
  driverStatuses: {
    DayOff?: string[]
    OnVacation?: string[]
    OnSickLeave?: string[]
    Intern?: string[]
    Fired?: string[]
    OnWork?: string[]
    total?: number
  }
  convoySummary?: {
    driverOnWork?: number
    busOnWork?: number
  }
  date: string
  disableLinks?: boolean
}

const BottomBlocks = memo(function BottomBlocks({
  repairBuses,
  dayOffBuses,
  driverStatuses,
  convoySummary,
  date,
  disableLinks = false,
}: BottomBlocksProps) {
  const [showDayOffBuses, setShowDayOffBuses] = useState(true)
  const [showDayOffDrivers, setShowDayOffDrivers] = useState(true)

  const handleToggleDrivers = useCallback(() => setShowDayOffDrivers((prev) => !prev), [])
  const handleToggleBuses = useCallback(() => setShowDayOffBuses((prev) => !prev), [])

  const renderList = useCallback(
    (items: (string | { garageNumber: string; govNumber: string })[], show: boolean) => {
      if (!show) return <div className="text-sm text-gray-400">Скрыто</div>
      return (
        <div className="flex flex-wrap gap-1">
          {items.map((item, i) => {
            const label =
              typeof item === "string" ? item : `${item.garageNumber} (${item.govNumber})`
            return (
              <span
                key={typeof item === "string" ? item + i : `${item.garageNumber}-${item.govNumber}`}
                className="px-2 py-0.5 bg-white rounded border text-sm shadow-sm font-semibold"
              >
                {label}
              </span>
            )
          })}
        </div>
      )
    },
    []
  )

  const StatusBlock = memo(function StatusBlock({
    title,
    list,
    show,
    toggleShow,
    colorClass,
    statusKey,
  }: {
    title: string
    list: string[] | number | undefined
    show: boolean
    toggleShow: () => void
    colorClass: string
    statusKey?: string
  }) {
    const url = statusKey
      ? `/dashboard/fleet-manager/drivers?status=${statusKey}&date=${date}`
      : undefined

    return (
      <div
        className={`bg-gray-50 border rounded-lg p-3 shadow-sm ${url ? "hover:bg-gray-100 cursor-pointer" : ""}`}
        onClick={() => url && (window.location.href = url)}
      >
        <h4 className={`font-bold mb-2 flex items-center justify-between ${colorClass}`}>
          <span className="flex items-center gap-2">
            {title}{" "}
            <span className="text-sm text-gray-500">
              ({Array.isArray(list) ? list.length : list ?? 0})
            </span>
          </span>
          {Array.isArray(list) && list.length > 0 && !statusKey && (
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

        {Array.isArray(list) && show && list.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {list.map((name, i) => (
              <li key={name + i} className="border rounded px-2 py-0.5 bg-white text-sm font-medium shadow-sm">
                {formatShortName(name)}
              </li>
            ))}
          </ul>
        ) : typeof list === "number" ? (
          <div className="text-gray-800 font-bold text-lg">{list}</div>
        ) : (
          !statusKey && <div className="text-sm text-gray-400">Скрыто</div>
        )}
      </div>
    )
  })

  return (
    <div className="grid gap-3 mt-3">
      {!disableLinks ? (
        <Link
          href={`/dashboard/repairs/planned?date=${date}`}
          className="inline-block text-blue-600 hover:underline text-base font-semibold"
        >
          🛠 Перейти к плановому ремонту →
        </Link>
      ) : (
        <div className="text-base font-semibold text-gray-400 cursor-not-allowed">
          🛠 Перейти к плановому ремонту →
        </div>
      )}

      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <h4 className="font-bold text-sky-700 mb-3 flex items-center gap-2">
          <Wrench className="h-5 w-5" /> Ремонт
        </h4>
        {renderList(repairBuses, true)}
      </div>

      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <h4 className="font-bold text-red-700 mb-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="text-xl">🚫</span> Автобусы на выходном
            <span className="text-sm text-gray-500">({dayOffBuses.length})</span>
          </span>
          {dayOffBuses.length > 0 && (
            <button
              onClick={handleToggleBuses}
              className="text-sm text-blue-600 hover:underline"
            >
              {showDayOffBuses ? "Скрыть" : "Показать"}
            </button>
          )}
        </h4>
        {renderList(dayOffBuses, showDayOffBuses)}
      </div>

      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
          <span className="text-xl">📊</span> Назначено
        </h4>
        <ul className="text-sm text-gray-800 space-y-1 font-semibold leading-tight">
          <li>• Водителей: {convoySummary?.driverOnWork ?? "—"}</li>
          <li>• Автобусов: {convoySummary?.busOnWork ?? "—"}</li>
        </ul>
      </div>

      <StatusBlock
        title="👤 Водители на выходном"
        list={driverStatuses?.DayOff}
        show={showDayOffDrivers}
        toggleShow={handleToggleDrivers}
        colorClass="text-red-700"
      />
      <StatusBlock
        title="🤒 Больничный"
        list={driverStatuses?.OnSickLeave}
        show={true}
        toggleShow={() => {}}
        colorClass="text-orange-700"
        statusKey="OnSickLeave"
      />
      <StatusBlock
        title="🏖️ Отпуск"
        list={driverStatuses?.OnVacation}
        show={true}
        toggleShow={() => {}}
        colorClass="text-yellow-700"
        statusKey="OnVacation"
      />
      <StatusBlock
        title="🧪 Стажёры"
        list={driverStatuses?.Intern}
        show={true}
        toggleShow={() => {}}
        colorClass="text-cyan-700"
        statusKey="Intern"
      />
    </div>
  )
})

export default BottomBlocks
