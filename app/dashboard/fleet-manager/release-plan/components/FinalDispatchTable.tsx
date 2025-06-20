"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { getAuthData } from "@/lib/auth-utils"
import { releasePlanService } from "@/service/releasePlanService"
import type { FinalDispatchData, OrderAssignment } from "@/types/releasePlanTypes"
import AssignmentRow from "./AssignmentRow"
import ReserveRowSection from "./ReserveRowSection"
import BottomBlocks from "./BottomBlocks"

interface ReserveAssignmentUI {
  id: string
  sequenceNumber: number
  departureTime: string
  scheduleTime: string
  endTime: string
  garageNumber: string
  govNumber: string
  busId: string | null
  driver?: {
    id: string
    fullName: string
    serviceNumber: string
  }
  additionalInfo: string
}

interface FinalDispatchTableProps {
  data: FinalDispatchData
  depotNumber?: number
  driversCount: number
  convoyId?: string
  busesCount: number
  convoySummary?: {
    totalDrivers?: number
    totalBuses?: number
    driverOnWork?: number
    busOnWork?: number
  }
  dayType: string
  readOnlyMode?: boolean
  disableLinks?: boolean
  orderAssignments?: OrderAssignment[] // ← добавь это
}

export default function FinalDispatchTable({
  data,
  depotNumber,
  driversCount,
  busesCount,
  convoySummary,
  dayType,
  orderAssignments = [], // ← добавлено здесь
  readOnlyMode = false,
  disableLinks = false,
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
  const auth = getAuthData()
  const convoyId = auth?.convoyId

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
            План выпуска · Колонна №{depotNumber ?? "—"}
          </div>
          <div className="text-sm text-gray-600">
            на {displayDate.toLocaleDateString("ru-RU")}
          </div>
        </div>
      </div>

      {/* Таблицы маршрутов */}
      {routeGroups.map((group) => {
        const sortedAssignments = useMemo(() => {
          return [...group.assignments].sort(
            (a, b) => Number(a.busLineNumber) - Number(b.busLineNumber)
          )
        }, [group.assignments])

        return (
          <div key={group.routeId} className="flex mt-6 rounded shadow border overflow-hidden">
            {disableLinks ? (
              <div className="bg-sky-100 text-black flex flex-col items-center justify-center px-6 py-2 min-w-[110px] opacity-50 cursor-not-allowed">
                <div className="text-5xl font-extrabold leading-none">{group.routeNumber}</div>
                <div className="text-base font-semibold mt-1 tracking-wide uppercase text-gray-800">Маршрут</div>
              </div>
            ) : (
              <Link
                href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/route/${group.routeId}?from=final-dispatch`}
                className="bg-sky-100 text-black flex flex-col items-center justify-center px-6 py-2 min-w-[110px] hover:bg-sky-200 transition"
              >
                <div className="text-5xl font-extrabold leading-none">{group.routeNumber}</div>
                <div className="text-base font-semibold mt-1 tracking-wide uppercase text-gray-800">Маршрут</div>
              </Link>
            )}
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
                  {sortedAssignments.map((a, i) => (
                    <AssignmentRow key={i} a={a} i={i} readOnlyMode={readOnlyMode} displayDate={displayDate} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* Блоки РЕЗЕРВ и ЗАКАЗ */}
      <ReserveRowSection
        title="РЕЗЕРВ"
        color="yellow"
        list={reserveAssignments.map((r, index) => ({
          id: r.id,
          sequenceNumber: r.sequenceNumber ?? index + 1,
          departureTime: r.departureTime ?? "—",
          scheduleTime: r.scheduleTime ?? "—",
          endTime: r.endTime ?? "—",
          garageNumber: r.garageNumber ?? "—",
          govNumber: r.govNumber ?? "—",
          busId: null, // ← просто null, так как поля busId нет
          driver: r.driver
            ? {
                id: r.driver.id,
                fullName: r.driver.fullName,
                serviceNumber: r.driver.serviceNumber,
              }
            : undefined,
          additionalInfo: r.additionalInfo ?? "",
        }))}
        
        dayType={dayType}
        date={date}
        disableLinks={disableLinks}
        readOnlyMode={readOnlyMode}
        displayDate={displayDate}
        linkPath="reserve"
      />
      <ReserveRowSection
        title="ЗАКАЗ"
        color="lime"
        list={orderAssignments}
        dayType={dayType}
        date={date}
        disableLinks={disableLinks}
        readOnlyMode={readOnlyMode}
        displayDate={displayDate}
        linkPath="orders"
      />

      {/* Блоки снизу */}
      <BottomBlocks
        repairBuses={repairBuses}
        dayOffBuses={dayOffBuses}
        driverStatuses={{
          OnWork: 0,
          DayOff: driverStatuses.DayOff?.length ?? 0,
          OnVacation: driverStatuses.OnVacation?.length ?? 0,
          OnSickLeave: driverStatuses.OnSickLeave?.length ?? 0,
          Intern: driverStatuses.Intern?.length ?? 0,
          Fired: 0,
          total: driversCount
        }}
        convoySummary={convoySummary}
        date={date}
        disableLinks={disableLinks}
      />
    </div>
  )
}
