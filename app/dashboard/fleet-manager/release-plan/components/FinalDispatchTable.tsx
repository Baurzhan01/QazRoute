"use client"

import React from "react"
import type { FinalDispatchData, RouteGroup, RouteAssignment, ReserveAssignment } from "@/types/releasePlanTypes"
import { getAuthData } from "@/lib/auth-utils"

interface FinalDispatchTableProps {
  data: FinalDispatchData
}

export default function FinalDispatchTable({ data }: FinalDispatchTableProps) {
  const { routeGroups = [], reserveAssignments = [], date } = data
  const displayDate = new Date(date)

  const authData = getAuthData()
  const convoyNumber = authData?.convoyNumber ?? "—"

  return (
    <div id="final-dispatch-table" className="flex flex-col gap-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold">Итоговый план выпуска автобусов</h2>
        <p className="text-gray-600 text-lg">{displayDate.toLocaleDateString()}</p>
        <p className="text-gray-700 font-semibold">Автоколонна: № {convoyNumber}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-sky-600 text-white z-10">
            <tr>
              <th className="border p-2 w-16">№</th>
              <th className="border p-2 w-28">Гар. номер</th>
              <th className="border p-2 w-32">Гос. номер</th>
              <th className="border p-2">ФИО</th>
              <th className="border p-2">Таб. номер</th>
              <th className="border p-2">Время выхода</th>
              <th className="border p-2">По графику</th>
              <th className="border p-2">Доп. информация</th>
              <th className="border p-2">Пересм.</th>
              <th className="border p-2">ФИО</th>
              <th className="border p-2">Таб. номер</th>
              <th className="border p-2">Конец работы</th>
            </tr>
          </thead>
          <tbody>
            {routeGroups.length === 0 && (
              <tr>
                <td colSpan={12} className="border p-4 text-center text-gray-500">Нет данных по маршрутам</td>
              </tr>
            )}

            {routeGroups.map((group: RouteGroup) => (
              <React.Fragment key={group.routeId}>
                <tr className="bg-sky-100 font-semibold text-sky-900">
                  <td colSpan={12} className="p-2">Маршрут № {group.routeNumber}</td>
                </tr>

                {group.assignments.map((assignment: RouteAssignment, index: number) => (
                  <tr key={`${group.routeId}-${index}`} className="even:bg-gray-50">
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2">{assignment.garageNumber}</td>
                    <td className="border p-2">{assignment.stateNumber}</td>
                    <td className="border p-2">{assignment.driver?.fullName ?? "—"}</td>
                    <td className="border p-2 text-center">{assignment.driver?.serviceNumber ?? "—"}</td>
                    <td className="border p-2">{assignment.departureTime}</td>
                    <td className="border p-2">{assignment.scheduleTime}</td>
                    <td className="border p-2">{assignment.additionalInfo ?? "—"}</td>
                    <td className="border p-2">{assignment.additionalInfo ?? "—"}</td>
                    <td className="border p-2">{assignment.shift2Driver?.fullName ?? "—"}</td>
                    <td className="border p-2 text-center">{assignment.shift2Driver?.serviceNumber ?? "—"}</td>
                    <td className="border p-2">{assignment.endTime}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {reserveAssignments.length > 0 && (
              <>
                <tr className="bg-yellow-50 font-semibold text-yellow-900">
                  <td colSpan={12} className="p-2">Резерв</td>
                </tr>
                {reserveAssignments.map((assignment: ReserveAssignment, index: number) => (
                  <tr key={`reserve-${index}`} className="even:bg-gray-50">
                    <td className="border p-2 text-center">{assignment.sequenceNumber}</td>
                    <td className="border p-2">{assignment.garageNumber}</td>
                    <td className="border p-2">{assignment.stateNumber}</td>
                    <td className="border p-2">{assignment.driver?.fullName ?? "—"}</td>
                    <td className="border p-2 text-center">{assignment.driver?.serviceNumber ?? "—"}</td>
                    <td className="border p-2">{assignment.departureTime}</td>
                    <td className="border p-2">{assignment.scheduleTime}</td>
                    <td className="border p-2">{assignment.additionalInfo ?? "—"}</td>
                    <td className="border p-2">—</td>
                    <td className="border p-2">—</td>
                    <td className="border p-2">—</td>
                    <td className="border p-2">{assignment.endTime}</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
