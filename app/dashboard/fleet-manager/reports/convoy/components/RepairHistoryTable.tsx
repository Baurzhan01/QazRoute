"use client"

import { RouteExitRepairDto } from "@/types/routeExitRepair.types"
import { formatTime } from "@/lib/utils/time-utils"
import { exportConvoyRepairHistory } from "@/lib/excel/exportConvoyRepairHistory"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Props {
  repairs: RouteExitRepairDto[]
  loading?: boolean
}

export default function RepairHistoryTable({ repairs, loading }: Props) {
  if (loading) return <p className="text-muted-foreground">Загрузка...</p>
  if (!repairs.length) return <p className="text-muted-foreground">Нет данных для отображения</p>

  return (
    <div className="overflow-x-auto border rounded-md">
      <div className="flex justify-end mb-4">
      <Button onClick={() => exportConvoyRepairHistory(repairs, "repair-convoy-history")}>
        Экспорт в Excel
      </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 text-base font-bold">
            <TableHead className="text-gray-700 w-8">№</TableHead>
            <TableHead className="text-gray-700">Дата</TableHead>
            <TableHead className="text-gray-700">VIN</TableHead>
            <TableHead className="text-gray-700">Марка</TableHead>
            <TableHead className="text-gray-700">Техпаспорт</TableHead>
            <TableHead className="text-gray-700">Водитель</TableHead>
            <TableHead className="text-gray-700 w-52">Причина</TableHead>
            <TableHead className="text-gray-700">Начало ремонта</TableHead>
            <TableHead className="text-gray-700">Окончание ремонта</TableHead>
            <TableHead className="text-gray-700">Дата выезда</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repairs.map((r, index) => {
            const fullName = r.driver?.fullName || ""
            const [last, first, patronymic] = fullName.split(" ")
            const shortName = `${last || "—"} ${first?.[0] || ""}.${patronymic?.[0] || ""}.`
            const serviceNum = r.driver?.serviceNumber || "—"

            return (
              <TableRow key={r.id}>
                <TableCell className="font-semibold">{index + 1}</TableCell>
                <TableCell>{r.startDate || "—"}</TableCell>
                <TableCell>{r.bus?.vinCode || "—"}</TableCell>
                <TableCell>{r.bus?.brand || "—"}</TableCell>
                <TableCell>{r.bus?.dataSheetNumber || "—"}</TableCell>
                <TableCell>{`${shortName} (${serviceNum})`}</TableCell>
                <TableCell className="text-red-600 font-bold">{r.text || "—"}</TableCell>
                <TableCell>{r.startRepairTime ? formatTime(r.startRepairTime) : "—"}</TableCell>
                <TableCell>{r.endRepairTime ? formatTime(r.endRepairTime) : "—"}</TableCell>
                <TableCell>{r.endRepairDate || "—"}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
