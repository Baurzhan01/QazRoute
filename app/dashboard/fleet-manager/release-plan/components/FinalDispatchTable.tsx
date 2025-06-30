"use client"

import Link from "next/link"
import { getAuthData } from "@/lib/auth-utils"
import type { FinalDispatchData, OrderAssignment } from "@/types/releasePlanTypes"
import { mapToReserveAssignmentUI } from "../utils/releasePlanUtils"
import AssignmentRow from "./AssignmentRow"
import ReserveRowSection from "./ReserveRowSection"
import BottomBlocks from "./BottomBlocks"

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
  disableLinks?: boolean
  orderAssignments?: OrderAssignment[]
}

export default function FinalDispatchTable({
  data,
  depotNumber,
  driversCount,
  busesCount,
  convoySummary,
  dayType,
  readOnlyMode = false,
  disableLinks = false,
  orderAssignments = [],
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

  const mappedReserve = reserveAssignments.map((r, i) =>
    mapToReserveAssignmentUI(r, i, "Reserved")
  )
  const mappedOrders = orderAssignments.map((r, i) =>
    mapToReserveAssignmentUI(r, i, "Order")
  )

  return (
    <div className="text-[18px] leading-relaxed space-y-1 text-gray-900">
      <div className="flex justify-between border px-6 py-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="space-y-1">
          <div><strong>Водителей в колонне:</strong> {convoySummary?.totalDrivers ?? driversCount}</div>
          <div><strong>Автобусов в колонне:</strong> {convoySummary?.totalBuses ?? busesCount}</div>
          <div><strong>Привл. автобусов:</strong> 0</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-lg tracking-wide">
            План выпуска · Колонна №{depotNumber ?? "—"}
          </div>
          <div className="text-xl font-bold tracking-wide">
            на {displayDate.toLocaleDateString("ru-RU")}
          </div>
        </div>
      </div>

      {routeGroups.map((group) => {
        const sortedAssignments = group.assignments.length > 5
          ? [...group.assignments].sort((a, b) => Number(a.busLineNumber) - Number(b.busLineNumber))
          : group.assignments

        const hasSecondShift = sortedAssignments.some(a => a.shift2Driver)

        return (
          <div key={group.routeId} className="flex mt-6 rounded shadow border overflow-hidden">
            {disableLinks ? (
              <div className="bg-sky-100 text-black flex flex-col items-center justify-center px-6 py-2 min-w-[110px] opacity-50">
                <div className="text-5xl font-extrabold leading-none">{group.routeNumber}</div>
                <div className="text-base font-semibold mt-1 uppercase text-gray-800">Маршрут</div>
              </div>
            ) : (
              <Link
                href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/route/${group.routeId}?from=final-dispatch`}
                className="bg-sky-100 text-black flex flex-col items-center justify-center px-6 py-2 min-w-[110px] hover:bg-sky-200 transition"
              >
                <div className="text-5xl font-extrabold leading-none">{group.routeNumber}</div>
                <div className="text-base font-semibold mt-1 uppercase text-gray-800">Маршрут</div>
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
                    {hasSecondShift && (
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
                    <AssignmentRow
                      key={a.dispatchBusLineId || `${group.routeId}-${i}`}
                      a={a}
                      i={i}
                      readOnlyMode={readOnlyMode}
                      displayDate={displayDate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      <ReserveRowSection
        title="РЕЗЕРВ"
        color="yellow"
        list={mappedReserve}
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
        list={mappedOrders}
        dayType={dayType}
        date={date}
        disableLinks={disableLinks}
        readOnlyMode={readOnlyMode}
        displayDate={displayDate}
        linkPath="orders"
      />

      <BottomBlocks
        repairBuses={repairBuses}
        dayOffBuses={dayOffBuses}
        driverStatuses={{
          DayOff: driverStatuses.DayOff ?? [],
          OnVacation: driverStatuses.OnVacation ?? [],
          OnSickLeave: driverStatuses.OnSickLeave ?? [],
          Intern: driverStatuses.Intern ?? [],
          Fired: [],
          total: driversCount,
        }}
        convoySummary={convoySummary}
        date={date}
        disableLinks={disableLinks}
      />
    </div>
  )
}
