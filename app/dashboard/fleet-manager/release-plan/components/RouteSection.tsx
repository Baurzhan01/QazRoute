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
    <div className="overflow-auto rounded-md border print-export">
      <table className="w-full text-sm text-gray-800 border-collapse">
        <thead className="bg-sky-100 text-sky-900">
          <tr>
            <th className="p-2 border text-center">Маршрут</th>
            <th className="p-2 border text-center">№</th>
            <th className="p-2 border text-center">Гар. номер</th>
            <th className="p-2 border text-center">Гос. номер</th>
            <th className="p-2 border text-center">ФИО</th>
            <th className="p-2 border text-center">Таб. номер</th>
            <th className="p-2 border text-center">Время выхода</th>
            <th className="p-2 border text-center w-[800px]">Доп. информация</th>
            {hasSecondShift && (
              <>
                <th className="p-2 border text-center">Пересменка</th>
                <th className="p-2 border text-center">ФИО</th>
                <th className="p-2 border text-center">Таб. номер</th>
              </>
            )}
            <th className="p-2 border text-center">Конец</th>
          </tr>
        </thead>
        <tbody>
          {sortedAssignments.map((a: RouteAssignment, i: number) => (
            <tr key={a.dispatchBusLineId || `${group.routeId}-${i}`}>
              {/* Первая колонка: ячейка с маршрутами — объединена по rowspan */}
              {i === 0 && (
                <td
                className="p-2 border text-center text-sm font-bold align-middle bg-[#e0f2fe] special-route-bg"
                rowSpan={sortedAssignments.length}
                style={{ minWidth: '120px', verticalAlign: 'middle' }}
              >
                {disableLinks ? (
                  <div className="w-full h-full flex items-center justify-center px-2 py-6 bg-sky-100 text-4xl font-bold font-semibold text-center break-words whitespace-pre-wrap">
                    {group.routeNumber}
                  </div>
                ) : (
                  <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/route/${group.routeId}?from=final-dispatch`}>
                    <div className="w-full h-full flex items-center justify-center px-2 py-6 bg-sky-100 hover:bg-sky-200 text-lg font-semibold text-center break-words whitespace-pre-wrap transition">
                      {group.routeNumber}
                    </div>
                  </Link>
                )}
              </td>                   
              )}

              <AssignmentRow
                a={a}
                i={i}
                readOnlyMode={readOnlyMode}
                displayDate={displayDate}
                renderWithoutRoute
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
