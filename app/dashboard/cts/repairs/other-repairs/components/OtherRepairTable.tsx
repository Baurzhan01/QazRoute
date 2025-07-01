"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { exportOtherRepairsToExcel } from "../utils/exportOtherRepairs"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CheckCircle, Download } from "lucide-react"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { cn } from "@/lib/utils"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"
import { getAuthData } from "@/lib/auth-utils"

interface OtherRepairTableProps {
  from: Date
  to: Date
}

export default function OtherRepairTable({ from, to }: OtherRepairTableProps) {
  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const auth = getAuthData()
  const depotId = auth?.busDepotId ?? ""

  const fetchRepairs = async () => {
    if (!depotId) return
    const startDate = format(from, "yyyy-MM-dd")
    const endDate = format(to, "yyyy-MM-dd")

    const statsRes = await routeExitRepairService.getStatsByDate(depotId, startDate, endDate)
    if (!statsRes.isSuccess) {
      toast({ title: "Ошибка", description: "Не удалось загрузить статистику", variant: "destructive" })
      return
    }

    const res = await routeExitRepairService.getByDate(startDate, depotId)
    if (res.isSuccess && res.value) {
      const filtered = res.value.filter(r => r.repairType === "Other")
      setRepairs(filtered)
    } else {
      setRepairs([])
    }
  }

  useEffect(() => {
    fetchRepairs()
    const interval = setInterval(() => {
      fetchRepairs()
    }, 5000)
    return () => clearInterval(interval)
  }, [from, to, depotId])

  const handleFinishRepair = async (repairId: string) => {
    const now = new Date()
    const date = format(now, "yyyy-MM-dd")
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    setLoadingId(repairId)
    const res = await routeExitRepairService.setEndTime(repairId, date, time)
    setLoadingId(null)

    if (res.isSuccess) fetchRepairs()
    else toast({ title: "Ошибка", description: res.error || "Не удалось завершить ремонт" })
  }

  return (
    <div className="overflow-x-auto">
      <Button variant="outline" onClick={() => exportOtherRepairsToExcel(repairs)}>
        <Download className="w-4 h-4 mr-2" />
        Экспорт в Excel
      </Button>
      <table className="w-full text-sm border mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">№</th>
            <th className="p-2 border">Дата</th>
            <th className="p-2 border">Колонна</th>
            <th className="p-2 border">Маршрут / Выход</th>
            <th className="p-2 border">ФИО водителя</th>
            <th className="p-2 border">Гос. № (Гаражный №)</th>
            <th className="p-2 border">Причина</th>
            <th className="p-2 border">Время начала</th>
            <th className="p-2 border">Время окончания</th>
            <th className="p-2 border">Дата окончания</th>
            <th className="p-2 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => (
            <tr key={r.id} className={cn("border", r.endRepairTime ? "bg-green-100" : "")}>
              <td className="p-2 border text-center">{idx + 1}</td>
              <td className="p-2 border text-center">{r.startDate || "-"}</td>
              <td className="p-2 border text-center">{r.convoy?.number ? `№${r.convoy.number}` : "-"}</td>
              <td className="p-2 border text-center">
                {r.route?.number ? `${r.route.number}${r.busLine?.number ? ` / ${r.busLine.number}` : ""}` : "-"}
              </td>
              <td className="p-2 border">
                {r.driver?.fullName ? `${r.driver.fullName} (${r.driver.serviceNumber})` : "-"}
              </td>
              <td className="p-2 border text-center">
                {r.bus?.govNumber && r.bus?.garageNumber ? `${r.bus.govNumber} (${r.bus.garageNumber})` : "-"}
              </td>
              <td className="p-2 border text-red-600 font-medium">{r.text}</td>
              <td className="p-2 border text-center">{r.startRepairTime || "–"}</td>
              <td className="p-2 border text-center">{r.endRepairTime || "–"}</td>
              <td className="p-2 border text-center">{r.endRepairDate || "–"}</td>
              <td className="p-2 border text-center">
                {!r.endRepairTime && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleFinishRepair(r.id)}
                        disabled={loadingId === r.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Завершить ремонт
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {r.endRepairTime && (
                  <span className="text-xs text-green-600">Статус автобуса: активен</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
