"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  RouteExitRepairDto,
  RouteExitRepairStatus,
} from "@/types/routeExitRepair.types"

interface Props {
  type: RouteExitRepairStatus
  allItems: RouteExitRepairDto[]
  label: string
  loading?: boolean
}

export function RepairTypeTable({ type, allItems, label, loading }: Props) {
  const filtered = allItems.filter(r => r.repairType?.toLowerCase() === type.toLowerCase())
  const showEmpty = !loading && filtered.length === 0

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold mt-8 mb-2">
        {label} — {filtered.length} записей
      </h2>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Гос. номер</TableHead>
              <TableHead>Гаражный номер</TableHead>
              <TableHead>Марка</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Техпаспорт</TableHead>
              <TableHead>Автоколонна</TableHead>
              <TableHead>Причина</TableHead>
              <TableHead>Начало</TableHead>
              <TableHead>Окончание</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.bus?.govNumber || "—"}</TableCell>
                <TableCell>{r.bus?.garageNumber || "—"}</TableCell>
                <TableCell>{r.bus?.brand || "—"}</TableCell>
                <TableCell>{r.bus?.vinCode || "—"}</TableCell>
                <TableCell>{r.bus?.dataSheetNumber || "—"}</TableCell>
                <TableCell>{r.convoy?.number ? `№${r.convoy.number}` : "—"}</TableCell>
                <TableCell>{r.text || "—"}</TableCell>
                <TableCell>
                  {r.startDate} {r.startTime?.slice(0, 5) || ""}
                </TableCell>
                <TableCell>
                  {r.endRepairDate
                    ? `${r.endRepairDate} ${r.endRepairTime?.slice(0, 5) || ""}`
                    : "—"}
                </TableCell>
              </TableRow>
            ))}

            {showEmpty && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                  Нет данных по типу «{label}»
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}