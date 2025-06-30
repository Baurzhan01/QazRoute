// components/RouteSection.tsx
"use client"

import Link from "next/link"
import AssignmentRow from "./AssignmentRow"
import type { RouteGroup, RouteAssignment } from "@/types/releasePlanTypes"

interface Props {
  group: RouteGroup
  dayType: string
  date: string
  readOnlyMode?: boolean
  disableLinks?: boolean
  displayDate: Date
}

export default function RouteSection({
  group,
  dayType,
  date,
  readOnlyMode = false,
  disableLinks = false,
  displayDate,
}: Props) {
  const sortedAssignments: RouteAssignment[] =
    group.assignments.length > 5
      ? [...group.assignments].sort((a, b) => Number(a.busLineNumber) - Number(b.busLineNumber))
      : group.assignments

  const hasSecondShift = sortedAssignments.some(a => a.shift2Driver)

  return (
    <div className="flex mt-6 rounded shadow border overflow-hidden">
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
            {sortedAssignments.map((a: RouteAssignment, i: number) => (
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
}
