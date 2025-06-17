// components/RepairTable.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import EditRepairDialog from "./EditRepairDialog"
import type { RepairRecord } from "../hooks/usePlannedRepairs"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"

interface RepairTableProps {
  repairs: RepairRecord[]
  date: string
  convoyId: string
  buses: DisplayBus[]
  drivers: DisplayDriver[]
  onReload: () => void
  onDelete: (record: RepairRecord) => Promise<void>
  onUpdate: (record: RepairRecord) => Promise<void>
  isLoading: boolean
}

export default function RepairTable({
  repairs,
  date,
  convoyId,
  buses,
  drivers,
  onReload,
  onDelete,
  isLoading,
}: RepairTableProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<RepairRecord | null>(null)

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">🚌 Автобус</th>
            <th className="p-2">👨‍🔧 Водитель</th>
            <th className="p-2">📄 Описание</th>
            <th className="p-2 text-center" colSpan={2}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => (
            <tr key={r.id} className="border-t hover:bg-gray-50">
              <td className="p-2 font-medium">{r.bus.govNumber} ({r.bus.garageNumber})</td>
              <td className="p-2">{r.driver.fullName} (№ {r.driver.serviceNumber})</td>
              <td className="p-2 text-gray-700">{r.description || "—"}</td>
              <td className="p-2 text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Редактировать"
                    onClick={() => {
                      setSelectedRepair(r)
                      setEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Удалить"
                    onClick={() => onDelete(r)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRepair && (
        <EditRepairDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          date={date}
          bus={selectedRepair.bus}
          driver={selectedRepair.driver}
          description={selectedRepair.description}
          convoyId={convoyId}
          buses={buses}
          drivers={drivers}
          repairId={selectedRepair.id}
          onUpdated={onReload}
        />
      )}
    </div>
  )
}
