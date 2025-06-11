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
  onEdit:(repair: RepairRecord) =>void;
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
      <h3 className="text-lg font-semibold mb-2">Автоколонна №{convoyNumber}</h3>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">🚌 Автобус</th>
              <th className="p-2">👨‍🔧 Водитель</th>
              <th className="p-2">🛠 Описание</th>
              <th className="p-2 text-center">✏️</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((r) => (
              <tr key={`${r.bus.id}-${r.driver.id}`} className="border-t hover:bg-gray-50">
                <td className="p-2">{r.bus?.govNumber ?? "?"} ({r.bus?.garageNumber ?? "?"})</td>
                <td className="p-2">{r.driver?.fullName ?? "?"} (№ {r.driver?.serviceNumber ?? "?"})</td>
                <td className="p-2">{r.description || "—"}</td>
                <td className="p-2 text-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(r)}
                    >
                    <Pencil className="w-4 h-4 text-blue-600" />
                </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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