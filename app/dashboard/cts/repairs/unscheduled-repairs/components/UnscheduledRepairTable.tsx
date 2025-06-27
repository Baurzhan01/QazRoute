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
import { MoreHorizontal, Timer, CheckCircle } from "lucide-react"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { cn } from "@/lib/utils"
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

  const handleStartRepair = async (repairId: string) => {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    setLoadingId(repairId)
    const res = await routeExitRepairService.setStartTime(repairId, time)
    setLoadingId(null)
    res.isSuccess ? onRefresh?.() : toast({ title: "Ошибка", description: res.error || "Не удалось начать ремонт" })
  }

  const handleFinishRepair = async (repairId: string) => {
    const now = new Date()
    const date = format(now, "yyyy-MM-dd")
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
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

  return (
    <div className="overflow-x-auto">
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
            <th className="p-2 border">Время начала ремонта</th>
            <th className="p-2 border">Время окончания ремонта</th>
            <th className="p-2 border">Дата окончания</th>
            <th className="p-2 border">Время выезда</th>
            <th className="p-2 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => (
            <tr
            key={r.id}
            className={cn(
              "border",
              r.andTime ? "bg-green-100" : "",
              r.repairType === "LongTerm" ? "bg-yellow-100" : "",
              r.repairType === "Other" ? "bg-gray-100" : ""
            )}
          >
              <td className="p-2 border text-center">{idx + 1}</td>
              <td className="p-2 border text-center">{r.startDate || "-"}</td>
              <td className="p-2 border text-center">{r.startTime || "-"}</td>
              <td className="p-2 border text-center">
                {r.convoy?.number ? `№${r.convoy.number}` : "-"}
                {(r.repairType === "Other" || r.repairType === "LongTerm") && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {r.repairType === "Other"
                      ? "Переведено в прочий ремонт"
                      : "Переведено в длительный ремонт"}
                  </div>
                )}
              </td>
              <td className="p-2 border text-center">
                {r.route?.number ? `${r.route.number}${r.busLine?.number ? ` / ${r.busLine.number}` : ""}` : "-"}
              </td>
              <td className="p-2 border">
                {r.driver?.fullName ? `${shortenName(r.driver.fullName)} (${r.driver.serviceNumber})` : "-"}
              </td>
              <td className="p-2 border text-center">
                {r.bus?.govNumber && r.bus?.garageNumber ? `${r.bus.govNumber} (${r.bus.garageNumber})` : "-"}
              </td>
              <td className="p-2 border text-red-600 font-medium">{r.text}</td>
              <td className="p-2 border text-center">{r.startRepairTime || "–"}</td>
              <td className="p-2 border text-center">{r.endRepairTime || "–"}</td>
              <td className="p-2 border text-center">{r.endRepairDate || "–"}</td>
              <td className="p-2 border text-center">{r.andTime || "–"}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
