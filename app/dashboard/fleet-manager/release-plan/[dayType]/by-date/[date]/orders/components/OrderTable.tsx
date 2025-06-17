"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Bus, User, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { ReserveDepartureUI } from "@/types/reserve.types";
import { releasePlanService } from "@/service/releasePlanService";
import AssignmentDialog from "./OrderAssignmentDialog"

interface ReserveDepartureExtended extends ReserveDepartureUI {
  justAdded?: boolean;
  isEmptyRow?: boolean;
}

interface ReserveTableProps {
  departures: ReserveDepartureExtended[];
  onEditAssignment: (departure: ReserveDepartureUI) => void;
  date: string;
  onReload?: () => void;
  convoyId: string;
  status?: string; // "Order" для заказов
}

export default function OrderTable({
  departures,
  onEditAssignment,
  date,
  onReload,
  convoyId,
  status = "Order",
}: ReserveTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr>
              <th className="border p-2 w-10">№</th>
              <th className="border p-2 w-32">
                <Bus className="w-4 h-4 inline text-gray-500 mr-1" />Гар. номер
              </th>
              <th className="border p-2 w-32">Гос. номер</th>
              <th className="border p-2 w-48">
                <User className="w-4 h-4 inline text-gray-500 mr-1" />ФИО
              </th>
              <th className="border p-2 w-28">Таб. номер</th>
              <th className="border p-2 w-28">Выход</th>
              <th className="border p-2 w-28">По графику</th>
              <th className="border p-2 min-w-[200px]">Доп. информация</th>
              <th className="border p-2 w-20">Пересм.</th>
              <th className="border p-2 w-48">ФИО (2 смена)</th>
              <th className="border p-2 w-28">Таб. № (2 смена)</th>
              <th className="border p-2 w-48">Доп. инфо (2 смена)</th>
              <th className="border p-2 w-28">Конец</th>
              <th className="border p-2 w-32">Действия</th>
            </tr>
          </thead>
          <tbody>
            {departures.map((departure) => (
              <tr key={departure.id}>
                <td className="border p-2 text-center font-semibold">{departure.sequenceNumber}</td>
                <td className="border p-2">{departure.bus?.garageNumber || "—"}</td>
                <td className="border p-2">{departure.bus?.govNumber || "—"}</td>
                <td className="border p-2">{departure.driver?.fullName || "—"}</td>
                <td className="border p-2">{departure.driver?.serviceNumber || "—"}</td>
                <td className="border p-2">{departure.departureTime || "—"}</td>
                <td className="border p-2">{departure.scheduleTime || "—"}</td>
                <td className="border p-2 whitespace-pre-line">{departure.additionalInfo?.trim() || "—"}</td>
                <td className="border p-2">—</td>
                <td className="border p-2">{departure.shift2Driver?.fullName || "—"}</td>
                <td className="border p-2">{departure.shift2Driver?.serviceNumber || "—"}</td>
                <td className="border p-2">{departure.shift2AdditionalInfo || "—"}</td>
                <td className="border p-2">{departure.endTime || "—"}</td>
                <td className="border p-2">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onEditAssignment(departure)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Изменить
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        try {
                          await releasePlanService.removeFromReserve([departure.id]);
                          toast({ title: "Удалено из заказов" });
                          onReload?.();
                        } catch {
                          toast({
                            title: "Ошибка",
                            description: "Не удалось удалить заказ",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
