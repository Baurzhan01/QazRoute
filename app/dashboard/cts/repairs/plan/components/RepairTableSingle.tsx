"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import EditRepairDialog from "./EditRepairDialog";
import type { RepairRecord } from "@/types/repair.types";

interface RepairTableSingleProps {
  repairs: RepairRecord[];
  convoyNumber: number;
  convoyId: string;
  date: string;
  onReload: () => Promise<void>;
  onUpdate: (repair: RepairRecord) => Promise<void>;
  onEdit: (repair: RepairRecord) => void;
}

export default function RepairTableSingle({
  repairs,
  convoyNumber,
  convoyId,
  date,
  onReload,
  onEdit,
}: RepairTableSingleProps) {
  const [selected, setSelected] = useState<RepairRecord | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-sky-700 border-b pb-1">
        🚍 Автоколонна №{convoyNumber}
      </h3>

      {repairs.length === 0 ? (
        <p className="text-gray-500">Нет ремонтов в этой колонне</p>
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
                    <div className="text-sm text-gray-500">
                      Таб. № {r.driver?.serviceNumber || "—"}
                    </div>
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
                      onClick={() => onEdit(r)}
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

      {selected && (
        <EditRepairDialog
          open={true}
          onClose={() => setSelected(null)}
          date={date}
          repair={selected}
          onUpdated={async () => {
            await onReload();
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
