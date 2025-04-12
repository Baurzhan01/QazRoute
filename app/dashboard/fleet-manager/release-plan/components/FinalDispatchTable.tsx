"use client"

import React from "react"
import type { FinalDispatchData } from "../types/finalDispatch"

interface FinalDispatchTableProps {
  data: FinalDispatchData
}

export default function FinalDispatchTable({ data }: FinalDispatchTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th rowSpan={2} className="border p-2 text-left w-24">
              № выхода
            </th>
            <th rowSpan={2} className="border p-2 text-left w-28">
              Гар. номер
            </th>
            <th rowSpan={2} className="border p-2 text-left w-32">
              Государ. номер
            </th>
            <th colSpan={5} className="border p-2 text-center">
              План на 1-ю смену
            </th>
            <th colSpan={3} className="border p-2 text-center">
              План на 2-ю смену
            </th>
            <th rowSpan={2} className="border p-2 text-left w-28">
              Конец работы
            </th>
          </tr>
          <tr>
            <th className="border p-2 text-left w-48">ФИО</th>
            <th className="border p-2 text-left w-28">Таб. номер</th>
            <th className="border p-2 text-left w-28">Время выхода</th>
            <th className="border p-2 text-left w-28">По графику</th>
            <th className="border p-2 text-left w-48">Дополнительная информация</th>
            <th className="border p-2 text-left w-24">Пересм.</th>
            <th className="border p-2 text-left w-48">ФИО</th>
            <th className="border p-2 text-left w-28">Таб. номер</th>
          </tr>
        </thead>
        <tbody>
          {/* Отображаем все маршруты */}
          {data.routeGroups.map((group) => (
            <React.Fragment key={group.routeId}>
              {/* Заголовок маршрута */}
              <tr className="bg-gray-100">
                <td colSpan={12} className="font-bold text-lg p-2">
                  Маршрут № {group.routeNumber}
                </td>
              </tr>

              {/* Строки с назначениями */}
              {group.assignments.map((assignment, index) => (
                <tr key={`${group.routeId}-${index}`}>
                  <td className="border p-2 font-bold">{index + 1}</td>
                  <td className="border p-2">{assignment.garageNumber}</td>
                  <td className="border p-2">{assignment.stateNumber}</td>
                  <td className="border p-2">{assignment.driver.fullName}</td>
                  <td className="border p-2">{assignment.driver.personnelNumber}</td>
                  <td className="border p-2">{assignment.departureTime}</td>
                  <td className="border p-2">{assignment.scheduleTime}</td>
                  <td className="border p-2">{assignment.additionalInfo}</td>
                  <td className="border p-2"></td>
                  <td className="border p-2">{assignment.shift2Driver?.fullName || ""}</td>
                  <td className="border p-2">{assignment.shift2Driver?.personnelNumber || ""}</td>
                  <td className="border p-2">{assignment.endTime}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}

          {/* Отображаем резерв */}
          <tr className="bg-gray-100">
            <td colSpan={12} className="font-bold text-lg p-2">
              Резерв
            </td>
          </tr>

          {data.reserveAssignments.map((assignment, index) => (
            <tr key={`reserve-${index}`}>
              <td className="border p-2 font-bold">{assignment.sequenceNumber}</td>
              <td className="border p-2">{assignment.garageNumber}</td>
              <td className="border p-2">{assignment.stateNumber}</td>
              <td className="border p-2">{assignment.driver.fullName}</td>
              <td className="border p-2">{assignment.driver.personnelNumber}</td>
              <td className="border p-2">{assignment.departureTime}</td>
              <td className="border p-2">{assignment.scheduleTime}</td>
              <td className="border p-2">{assignment.additionalInfo}</td>
              <td className="border p-2"></td>
              <td className="border p-2">{assignment.shift2Driver?.fullName || ""}</td>
              <td className="border p-2">{assignment.shift2Driver?.personnelNumber || ""}</td>
              <td className="border p-2">{assignment.endTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
