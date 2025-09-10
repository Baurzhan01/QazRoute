"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { exportUnscheduledRepairs } from "../utils/exportUnscheduledRepairs";
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types";

interface LRTBreakdownTableProps {
  repairs: RouteExitRepairDto[];
  /** Ключ: `${busId}|${dateStr}` → номер и id заказа */
  orderIndex?: Record<string, { applicationNumber: number | string; id: string }>;
  /** yyyy-MM-dd выбранной даты (для ключа) */
  dateStr?: string;
}

function shortenName(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length < 3) return fullName;
  return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`;
}

export default function LRTBreakdownTable({
  repairs,
  orderIndex = {},
  dateStr = format(new Date(), "yyyy-MM-dd"),
}: LRTBreakdownTableProps) {
  const seenBusIds = new Set<string>();
  const repeatEntryIds = new Set<string>();
  for (const r of repairs) {
    const busId = r.bus?.id;
    if (!busId) continue;
    if (seenBusIds.has(busId)) repeatEntryIds.add(r.id);
    seenBusIds.add(busId);
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end my-4">
        <Button
          variant="outline"
          onClick={() => exportUnscheduledRepairs(repairs, format(new Date(), "yyyy-MM-dd"))}
        >
          <Download className="w-4 h-4 mr-2" />
          Экспорт в Excel
        </Button>
      </div>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">№</th>
            <th className="p-2 border">Дата</th>
            <th className="p-2 border">Время заезда</th>
            <th className="p-2 border">Колонна</th>
            <th className="p-2 border">Маршрут / Выход</th>
            <th className="p-2 border">ФИО водителя</th>
            <th className="p-2 border">Гос. № (Гаражный №)</th>
            <th className="p-2 border">№ заказа</th> {/* NEW */}
            <th className="p-2 border">Причина</th>
            <th className="p-2 border">Начало ремонта</th>
            <th className="p-2 border">Окончание ремонта</th>
            <th className="p-2 border">Дата окончания</th>
            <th className="p-2 border">Время выезда</th>
            <th className="p-2 border">Пробег</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => {
            const isRepeat = repeatEntryIds.has(r.id);
            const isLong = r.repairType === "LongTerm";
            const isFinished = !!r.andTime;
            const isReady = !!r.isReady;

            const rowColor = cn(
              isFinished && "bg-green-100",
              isReady && "bg-sky-100",
              isRepeat && "bg-yellow-100",
              isLong && "bg-red-100"
            );

            // ключ для индекса заказов
            const k =
              (r.bus?.id ? `${r.bus.id}|${r.startDate || dateStr}` : "") || "";
            const order = k ? orderIndex[k] : undefined;

            return (
              <tr key={r.id} className={cn("border", rowColor)}>
                <td className="p-2 border text-center">{idx + 1}</td>
                <td className="p-2 border text-center">{r.startDate || "-"}</td>
                <td className="p-2 border text-center">{r.startTime?.slice(0, 5) || "-"}</td>
                <td className="p-2 border text-center">
                  {r.convoy?.number ? `№${r.convoy.number}` : "-"}
                </td>
                <td className="p-2 border text-center">
                  {r.route?.number
                    ? `${r.route.number}${r.busLine?.number ? ` / ${r.busLine.number}` : ""}`
                    : r.reserveId
                    ? "С резерва"
                    : r.repairId && !r.dispatchBusLineId
                    ? "Плановый ремонт"
                    : r.repairId
                    ? "С заказа"
                    : "–"}
                </td>
                <td className="p-2 border">
                  {r.driver?.fullName ? `${shortenName(r.driver.fullName)} (${r.driver.serviceNumber})` : "-"}
                </td>
                <td className="p-2 border text-center">
                  {r.bus?.govNumber && r.bus?.garageNumber
                    ? `${r.bus.govNumber} (${r.bus.garageNumber})`
                    : "-"}
                </td>

                {/* NEW: № заказа с линком */}
                <td className="p-2 border text-center">
                  {order ? (
                    <Link
                      href={`/dashboard/mechanic/repairs/${order.id}`}
                      className="text-sky-600 hover:underline"
                    >
                      {order.applicationNumber || "—"}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="p-2 border text-red-600 font-medium">
                  <div
                    dangerouslySetInnerHTML={{ __html: r.text || "–" }}
                  />
                  {isRepeat && <div className="text-xs text-yellow-700">• Повторный заезд</div>}
                  {isLong && <div className="text-xs text-red-700">• Длительный ремонт</div>}
                </td>
                <td className="p-2 border text-center">{r.startRepairTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.endRepairTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.endRepairDate || "–"}</td>
                <td className="p-2 border text-center">{r.andTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.mileage ?? "–"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
