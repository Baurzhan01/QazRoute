"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Timer, CheckCircle, Download } from "lucide-react"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { cn } from "@/lib/utils"
import { exportUnscheduledRepairs } from "../utils/exportUnscheduledRepairs"
import type { RouteExitRepairDto, RouteExitRepairStatus } from "@/types/routeExitRepair.types"

interface UnscheduledRepairTableProps {
  repairs: RouteExitRepairDto[]
  onRefresh?: () => void
}

function shortenName(fullName: string): string {
  const parts = fullName.split(" ")
  if (parts.length < 3) return fullName
  return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`
}

export default function UnscheduledRepairTable({ repairs, onRefresh }: UnscheduledRepairTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Автообновление
  useEffect(() => {
    if (!onRefresh) return
    const interval = setInterval(() => onRefresh(), 5000)
    return () => clearInterval(interval)
  }, [onRefresh])

  const handleStartRepair = async (repairId: string) => {
    const now = new Date()
    const time = now.toTimeString().slice(0, 8)
    setLoadingId(repairId)
    const res = await routeExitRepairService.setStartTime(repairId, time)
    setLoadingId(null)
    res.isSuccess ? onRefresh?.() : toast({ title: "Ошибка", description: res.error || "Не удалось начать ремонт" })
  }

  const handleFinishRepair = async (repairId: string) => {
    const now = new Date()
    const date = format(now, "yyyy-MM-dd")
    const time = now.toTimeString().slice(0, 8)
    setLoadingId(repairId)
    const res = await routeExitRepairService.setEndTime(repairId, date, time)
    setLoadingId(null)
    res.isSuccess ? onRefresh?.() : toast({ title: "Ошибка", description: res.error || "Не удалось завершить ремонт" })
  }

  const handleChangeStatus = async (repairId: string, newStatus: RouteExitRepairStatus) => {
    setLoadingId(repairId)
    const res = await routeExitRepairService.updateStatus(repairId, newStatus)
    setLoadingId(null)
    res.isSuccess ? onRefresh?.() : toast({ title: "Ошибка", description: res.error || "Не удалось изменить статус" })
  }

  // Группировка записей по bus.id (для отметки повторных)
  const seenBusIds = new Set<string>()

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
            <th className="p-2 border">Причина</th>
            <th className="p-2 border">Начало ремонта</th>
            <th className="p-2 border">Окончание ремонта</th>
            <th className="p-2 border">Дата окончания</th>
            <th className="p-2 border">Время выезда</th>
            <th className="p-2 border">Пробег</th>
            <th className="p-2 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => {
            const busId = r.bus?.id
            const isLong = r.repairType === "LongTerm"
            const isRepeat = !!busId && seenBusIds.has(busId)
            if (busId) seenBusIds.add(busId)

            return (
              <tr
                key={r.id}
                className={cn(
                  "border",
                  r.andTime && "bg-green-100",
                  isRepeat && "bg-yellow-100",
                  isLong && "bg-red-100"
                )}
              >
                <td className="p-2 border text-center">{idx + 1}</td>
                <td className="p-2 border text-center">{r.startDate || "-"}</td>
                <td className="p-2 border text-center">{r.startTime?.slice(0, 5) || "-"}</td>
                <td className="p-2 border text-center">{r.convoy?.number ? `№${r.convoy.number}` : "-"}</td>
                <td className="p-2 border text-center">
                  {r.route?.number ? `${r.route.number}${r.busLine?.number ? ` / ${r.busLine.number}` : ""}` : "-"}
                </td>
                <td className="p-2 border">
                  {r.driver?.fullName ? `${shortenName(r.driver.fullName)} (${r.driver.serviceNumber})` : "-"}
                </td>
                <td className="p-2 border text-center">
                  {r.bus?.govNumber && r.bus?.garageNumber ? `${r.bus.govNumber} (${r.bus.garageNumber})` : "-"}
                </td>
                <td className="p-2 border text-red-600 font-medium">
                  {r.text}
                  {isRepeat && <span className="text-xs text-yellow-700"> • Повторный заезд</span>}
                  {isLong && <span className="text-xs text-red-700"> • Длительный ремонт</span>}
                </td>
                <td className="p-2 border text-center">{r.startRepairTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.endRepairTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.endRepairDate || "–"}</td>
                <td className="p-2 border text-center">{r.andTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.mileage ?? "–"}</td>
                <td className="p-2 border text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStartRepair(r.id)}
                        disabled={loadingId === r.id}
                      >
                        <Timer className="w-4 h-4 mr-2 text-sky-600" />
                        Начать ремонт
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleFinishRepair(r.id)}
                        disabled={loadingId === r.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Завершить ремонт
                      </DropdownMenuItem>
                      {r.repairType !== "Unscheduled" ? (
                        <DropdownMenuItem onClick={() => handleChangeStatus(r.id, "Unscheduled")}>
                          Вернуть в неплановый
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => handleChangeStatus(r.id, "Other")}>
                            Перевести в прочий ремонт
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeStatus(r.id, "LongTerm")}>
                            Перевести в длительный ремонт
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
