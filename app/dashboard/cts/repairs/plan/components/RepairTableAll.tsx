"use client";

import { useState } from "react";
import { Pencil, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroupedRepairsByConvoy, RepairRecord } from "@/types/repair.types";
import EditRepairDialog from "./EditRepairDialog";
import { exportAllRepairs } from "../utils/exportAllRepairs";

interface RepairTableAllProps {
  data: GroupedRepairsByConvoy[];
  date: string;
  onReload: () => Promise<void>;
  onEdit: (repair: RepairRecord) => void;
}

export default function RepairTableAll({
  data,
  date,
  onReload,
  onEdit,
}: RepairTableAllProps) {
  const [selectedRepair, setSelectedRepair] = useState<RepairRecord | null>(null);
  const [selectedConvoyId, setSelectedConvoyId] = useState<string | null>(null);

  const handleEditClick = (repair: RepairRecord, convoyId: string) => {
    setSelectedRepair(repair);
    setSelectedConvoyId(convoyId);
  };

  const handleDialogClose = () => {
    setSelectedRepair(null);
    setSelectedConvoyId(null);
  };

  return (
    <div className="space-y-8">
      {/* 🔽 Кнопка экспорта */}
      <div className="flex justify-end mb-4">
        <Button variant="secondary" onClick={() => exportAllRepairs(data, date)} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Экспорт в Excel
        </Button>
      </div>

      {/* 🔄 Таблицы по колоннам */}
      {data.length === 0 ? (
        <p className="text-gray-500">Нет данных по ремонтам</p>
      ) : (
        data.map(({ convoyId, convoyNumber, repairs }) => (
          <div key={convoyId} className="space-y-2">
            <h3 className="text-xl font-semibold text-sky-700 border-b pb-1">
              🚍 Автоколонна №{convoyNumber}
            </h3>

            {repairs.length === 0 ? (
              <p className="text-gray-400 italic ml-2">Нет ремонтов в этой колонне</p>
            ) : (
              <div className="rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-gray-800">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left">
                      <th className="px-4 py-2 w-[25%]">🚌 Автобус</th>
                      <th className="px-4 py-2 w-[25%]">👨‍🔧 Водитель</th>
                      <th className="px-4 py-2">🛠 Описание</th>
                      <th className="px-4 py-2 text-center w-[50px]">✏️</th>
                    </tr>
                  </thead>
                  <tbody>
                {repairs.map((r) => (
                  <tr
                    key={`${r.bus.id}-${r.driver.id}-${r.number}`}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2">
                      <div className="font-medium">
                        {r.bus?.govNumber || "—"}
                      </div>
                      <div className="text-sm text-gray-500">
                        ({r.bus?.garageNumber || "—"})
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium">{r.driver?.fullName || "—"}</div>
                      <div className="text-sm text-gray-500">Таб. № {r.driver?.serviceNumber || "—"}</div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-red-600 font-semibold text-base">
                        {r.description || <span className="text-gray-400 italic">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(r, convoyId)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}

      {/* ✏️ Диалог редактирования */}
      {selectedRepair && selectedConvoyId && (
        <EditRepairDialog
          open={true}
          onClose={handleDialogClose}
          date={date}
          repair={selectedRepair}
          onUpdated={async () => {
            await onReload();
            handleDialogClose();
          }}
        />
      )}
    </div>
  );
}
