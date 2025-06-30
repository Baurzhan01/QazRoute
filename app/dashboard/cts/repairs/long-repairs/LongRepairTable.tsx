"use client"

import { useState } from "react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CheckCircle, Undo2 } from "lucide-react"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { cn } from "@/lib/utils"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

interface LongRepairTableProps {
  repairs: RouteExitRepairDto[]
  onRefresh?: () => void
}

export default function LongRepairTable({ repairs, onRefresh }: LongRepairTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleFinishRepair = async (repair: RouteExitRepairDto) => {
    const now = new Date()
    const andDate = format(now, "yyyy-MM-dd")
    const andTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`

    setLoadingId(repair.id)
    const res = await routeExitRepairService.finishRepair(repair.id, {
      andDate,
      andTime,
      mileage: repair.mileage ?? 0,
      isExist: repair.isExist ?? false,
    })
    setLoadingId(null)

    res.isSuccess
      ? onRefresh?.()
      : toast({ title: "Ошибка", description: res.error || "Не удалось завершить ремонт" })
  }

  const handleReturnToUnscheduled = async (repairId: string) => {
    setLoadingId(repairId)
    const res = await routeExitRepairService.updateStatus(repairId, "Unscheduled")
    setLoadingId(null)

    res.isSuccess
      ? onRefresh?.()
      : toast({ title: "Ошибка", description: res.error || "Не удалось изменить статус" })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Дата начала</th>
            <th className="p-2 border">Колонна</th>
            <th className="p-2 border">Автобус</th>
            <th className="p-2 border">Водитель</th>
            <th className="p-2 border">Причина</th>
            <th className="p-2 border">Дата окончания</th>
            <th className="p-2 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => (
            <tr key={r.id} className="border">
              <td className="p-2 border text-center">{idx + 1}</td>
              <td className="p-2 border text-center">{r.startDate || "-"}</td>
              <td className="p-2 border text-center">{r.convoy?.number ? `№${r.convoy.number}` : "-"}</td>
              <td className="p-2 border text-center">
                {r.bus?.govNumber && r.bus?.garageNumber
                  ? `${r.bus.govNumber} (${r.bus.garageNumber})`
                  : "-"}
              </td>
              <td className="p-2 border text-center">
                {r.driver?.fullName ? `${r.driver.fullName} (${r.driver.serviceNumber})` : "-"}
              </td>
              <td className="p-2 border text-red-600 font-medium">{r.text}</td>
              <td className="p-2 border text-center">{r.endRepairDate || "-"}</td>
              <td className="p-2 border text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleFinishRepair(r)}
                      disabled={loadingId === r.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Завершить
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleReturnToUnscheduled(r.id)}
                      disabled={loadingId === r.id}
                    >
                      <Undo2 className="w-4 h-4 mr-2 text-yellow-600" /> Вернуть в неплановый
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
