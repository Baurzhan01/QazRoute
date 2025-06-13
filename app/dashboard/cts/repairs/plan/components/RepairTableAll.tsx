"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroupedRepairsByConvoy, RepairRecord } from "@/types/repair.types";
import EditRepairDialog from "./EditRepairDialog";

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
      {data.length === 0 ? (
        <p className="text-gray-500">Нет данных по ремонтам</p>
      ) : (
        data.map(({ convoyId, convoyNumber, repairs }) => (
          <div key={convoyId}>
            <h3 className="text-lg font-semibold mb-2">Автоколонна №{convoyNumber}</h3>
            {repairs.length === 0 ? (
              <p className="text-gray-500 ml-2">Нет ремонтов в этой колонне</p>
            ) : (
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
                      <tr
                        key={`${r.bus.id}-${r.driver.id}-${r.number}`}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-2">
                          {r.bus?.govNumber ?? "?"} ({r.bus?.garageNumber ?? "?"})
                        </td>
                        <td className="p-2">
                          {r.driver?.fullName ?? "?"} (№ {r.driver?.serviceNumber ?? "?"})
                        </td>
                        <td className="p-2">{r.description || "—"}</td>
                        <td className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(r, convoyId)}
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
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
