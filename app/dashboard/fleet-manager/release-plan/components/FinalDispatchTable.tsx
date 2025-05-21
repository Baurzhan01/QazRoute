"use client";

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { releasePlanService } from "@/service/releasePlanService";
import { formatDayOfWeek, getMonthName, formatDate } from "../utils/dateUtils";
import { InfoCell } from "./InfoCell";



import type { FinalDispatchData } from "@/types/releasePlanTypes";

interface FinalDispatchTableProps {
  data: FinalDispatchData;
  depotNumber?: number;
  driversCount: number;
  busesCount: number;
  convoySummary?: {
    totalDrivers?: number;
    totalBuses?: number;
    driverOnWork?: number;
    busOnWork?: number;
  };
}

export default function FinalDispatchTable({
  data,
  depotNumber,
  driversCount,
  busesCount,
  convoySummary,
}: FinalDispatchTableProps) {
  const {
    routeGroups = [],
    reserveAssignments = [],
    repairBuses = [],
    dayOffBuses = [],
    driverStatuses = {},
    date,
  } = data;

  const displayDate = new Date(date);

  return (
    <div id="final-dispatch-table" className="text-sm space-y-6">
      {/* 🔷 Верхняя панель */}
      <div className="flex justify-between border px-4 py-2 bg-gray-100 rounded">
        <div className="space-y-1">
          <div><strong>Водителей в колонне:</strong> {convoySummary?.totalDrivers ?? driversCount}</div>
          <div><strong>Автобусов в колонне:</strong> {convoySummary?.totalBuses ?? busesCount}</div>
          <div><strong>Привл. автоб:</strong> 0</div>
        </div>
        <div className="text-center">
          <div className="font-bold">
            План выпуска · Колонна №{depotNumber ?? "—"} ({formatDayOfWeek(displayDate)})
          </div>
          <div>
            на {displayDate.toLocaleDateString("ru-RU")} {getMonthName(displayDate)}
          </div>
        </div>
      </div>

      {/* 📋 Таблица маршрутов */}
      {routeGroups.map((group) => (
        <div key={group.routeId}>
          <div className="bg-sky-100 text-sky-900 font-semibold px-2 py-1 rounded-t mt-6">
            Маршрут № {group.routeNumber}
          </div>
          <table className="w-full border text-xs">
            <thead className="bg-sky-600 text-white">
              <tr>
                <th className="p-1 border">№</th>
                <th className="p-1 border">Гар. номер</th>
                <th className="p-1 border">Гос. номер</th>
                <th className="p-1 border">ФИО</th>
                <th className="p-1 border">Таб. номер</th>
                <th className="p-1 border">Время выхода</th>
                <th className="p-1 border">По графику</th>
                <th className="p-1 border">Доп. информация</th>
                <th className="p-1 border">Пересменка</th>
                <th className="p-1 border">ФИО</th>
                <th className="p-1 border">Таб. номер</th>
                <th className="p-1 border">Конец</th>
              </tr>
            </thead>
            <tbody>
              {group.assignments.map((a, i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border p-1 text-center">{i + 1}</td>
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

      {/* 🟨 Блок резерва */}
      {reserveAssignments.length > 0 && (
        <>
          <div className="bg-yellow-50 text-yellow-900 font-semibold px-2 py-1 rounded-t mt-6">
            Резерв
          </div>
          <table className="w-full border text-xs">
            <thead className="bg-yellow-400 text-black">
              <tr>
                <th className="p-1 border">№</th>
                <th className="p-1 border">Гар. номер</th>
                <th className="p-1 border">Гос. номер</th>
                <th className="p-1 border">ФИО</th>
                <th className="p-1 border">Таб. номер</th>
                <th className="p-1 border">Время выхода</th>
                <th className="p-1 border">По графику</th>
                <th className="p-1 border">Доп. информация</th>
                <th className="p-1 border">Пересменка</th>
                <th className="p-1 border">ФИО</th>
                <th className="p-1 border">Таб. номер</th>
                <th className="p-1 border">Конец</th>
              </tr>
            </thead>
            <tbody>
              {reserveAssignments.map((r, i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border p-1 text-center">{r.sequenceNumber}</td>
                  <td className="border p-1">{r.garageNumber}</td>
                  <td className="border p-1">{r.stateNumber}</td>
                  <td className="border p-1">{r.driver?.fullName ?? "—"}</td>
                  <td className="border p-1 text-center">{r.driver?.serviceNumber ?? "—"}</td>
                  <td className="border p-1">—</td>
                  <td className="border p-1">—</td>
                  <td className="border p-1">
                    {r.dispatchBusLineId ? (
                      <InfoCell
                        initialValue={r.additionalInfo ?? ""}
                        dispatchBusLineId={r.dispatchBusLineId}
                        date={displayDate}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="border p-1">—</td>
                  <td className="border p-1">—</td>
                  <td className="border p-1">—</td>
                  <td className="border p-1">{r.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* 📦 Нижние блоки */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs border rounded overflow-hidden bg-gray-50">
        <div className="border p-3">
          <strong className="block text-gray-700">Ремонт</strong>
          <ul className="mt-1 list-disc pl-4 text-gray-600">
            {repairBuses.length > 0 ? repairBuses.map((b, i) => <li key={i}>{b}</li>) : <li>—</li>}
          </ul>
        </div>
        <div className="border p-3">
          <strong className="block text-gray-700">Автобусы на выходном</strong>
          <ul className="mt-1 list-disc pl-4 text-gray-600">
            {dayOffBuses.length > 0 ? dayOffBuses.map((b, i) => <li key={i}>{b}</li>) : <li>—</li>}
          </ul>
        </div>
        <div className="border p-3 text-sm">
          <strong className="block text-gray-700">Назначено на сегодня</strong>
          <div className="pl-4 mt-1 text-gray-600 space-y-1">
            <div>• Водителей: {convoySummary?.driverOnWork ?? "—"}</div>
            <div>• Автобусов: {convoySummary?.busOnWork ?? "—"}</div>
          </div>
        </div>
      </div>

      {/* Статусы */}
      <div className="grid grid-cols-2 sm:grid-cols-4 mt-2 text-xs border rounded overflow-hidden bg-gray-50">
        {renderStatusBlock("Водители на выходном", driverStatuses?.DayOff)}
        {renderStatusBlock("Больничный", driverStatuses?.OnSickLeave)}
        {renderStatusBlock("Отпуск", driverStatuses?.OnVacation)}
        {renderStatusBlock("Стажёры", driverStatuses?.Intern)}
      </div>
    </div>
  );
}

function renderStatusBlock(title: string, list?: string[]) {
  return (
    <div className="border p-3">
      <strong className="block text-gray-700">{title}</strong>
      <div className="mt-1 text-gray-600 whitespace-pre-wrap break-words">
        {list?.length ? list.join(", ") : "—"}
      </div>
    </div>
  );
}
