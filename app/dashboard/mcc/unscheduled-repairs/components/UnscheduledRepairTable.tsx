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
import { MoreHorizontal, Trash2, Check, Pencil, ClipboardCheck } from "lucide-react"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { cn } from "@/lib/utils"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"
import EditRepairModal from "./EditRepairModal"

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
  const [editRepair, setEditRepair] = useState<RouteExitRepairDto | null>(null)

  useEffect(() => {
    if (!onRefresh) return
    const interval = setInterval(() => onRefresh(), 5000)
    return () => clearInterval(interval)
  }, [onRefresh])

  const handleFinish = async (repair: RouteExitRepairDto) => {
    const mileage = repair.mileage ?? 0
    setLoadingId(repair.id)

    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:00`
    const formattedDate = format(now, "yyyy-MM-dd")

    const result = await routeExitRepairService.finishRepair(repair.id, {
      andDate: formattedDate,
      andTime: time,
      mileage,
      isExist: true,
    })

    setLoadingId(null)
    if (result.isSuccess) onRefresh?.()
    else toast({ title: "Ошибка при завершении", description: result.error || "", variant: "destructive" })
  }

  const handleReady = async (repair: RouteExitRepairDto) => {
    setLoadingId(repair.id)
  
    const result = await routeExitRepairService.update(repair.id, {
      ...repair,
      isReady: true,
      text: `${repair.text?.trim() || ""}${repair.text?.trim()?.endsWith(".") ? "" : "."} <span style="color: black;">Готово!</span>`
    })
  
    setLoadingId(null)
  
    if (result.isSuccess) {
      onRefresh?.()
    } else {
      toast({
        title: "Ошибка при отметке готовности",
        description: result.error || "",
        variant: "destructive",
      })
    }
  }  

  const handleUnready = async (repair: RouteExitRepairDto) => {
    setLoadingId(repair.id)
  
    const result = await routeExitRepairService.update(repair.id, {
      ...repair,
      isReady: false,
      // можно удалить "Готово!" из текста, если нужно:
      text: repair.text?.replace(/\.?\s*<span[^>]*>Готово!<\/span>/i, "") ?? "",
    })
  
    setLoadingId(null)
  
    if (result.isSuccess) {
      onRefresh?.()
    } else {
      toast({
        title: "Ошибка при отмене готовности",
        description: result.error || "",
        variant: "destructive",
      })
    }
  }
  
  const handleDelete = async (repairId: string) => {
    if (!confirm("Удалить запись о ремонте?")) return
    const result = await routeExitRepairService.delete(repairId)
    if (result.isSuccess) onRefresh?.()
    else toast({ title: "Ошибка при удалении", description: result.error || "", variant: "destructive" })
  }

  const seenBusIds = new Set<string>()
  const repeatEntries = new Set<string>()

  repairs.forEach((r) => {
    const busId = r.bus?.id
    if (!busId) return
    if (seenBusIds.has(busId)) {
      repeatEntries.add(r.id)
    }
    seenBusIds.add(busId)
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
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
            const isRepeat = repeatEntries.has(r.id)
            const isLongTerm = r.repairType === "LongTerm"

            const rowClass = cn(
              "border",
              r.andTime ? "bg-green-100" : isLongTerm ? "bg-red-100" : isRepeat ? "bg-yellow-100" : "",
              r.isReady && "bg-sky-100"
            )

            return (
              <tr key={r.id} className={rowClass}>
                <td className="p-2 border text-center">{idx + 1}</td>
                <td className="p-2 border text-center">{r.startDate || "-"}</td>
                <td className="p-2 border text-center">{r.startTime?.slice(0, 5) || "-"}</td>
                <td className="p-2 border text-center">{r.convoy?.number ? `№${r.convoy.number}` : "-"}</td>
                <td className="p-2 border text-center">
                  {r.route?.number
                    ? `${r.route.number}${r.busLine?.number ? ` / ${r.busLine.number}` : ""}`
                    : r.reserveId
                    ? "С резерва"
                    : r.repairId && !r.dispatchBusLineId
                    ? "Плановый ремонт"
                    : r.repairId
                    ? "С заказа"
                    : "-"}
                </td>
                <td className="p-2 border">
                  {r.driver?.fullName
                    ? `${shortenName(r.driver.fullName)} (${r.driver.serviceNumber})`
                    : "-"}
                </td>
                <td className="p-2 border text-center">
                  {r.bus?.govNumber && r.bus?.garageNumber
                    ? `${r.bus.govNumber} (${r.bus.garageNumber})`
                    : "-"}
                </td>
                <td className="p-2 border text-red-600 font-medium">
                  <div dangerouslySetInnerHTML={{ __html: r.text || "–" }} />
                </td>
                <td className="p-2 border text-center">{r.startRepairTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.endRepairTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.endRepairDate || "–"}</td>
                <td className="p-2 border text-center">{r.andTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.mileage ?? "—"}</td>
                <td className="p-2 border text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!r.andTime && (
                        <DropdownMenuItem
                          onClick={() => handleFinish(r)}
                          disabled={loadingId === r.id}
                        >
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          Выезд на линию
                        </DropdownMenuItem>
                      )}
                      {r.isReady ? (
                          <DropdownMenuItem
                            onClick={() => handleUnready(r)}
                            disabled={loadingId === r.id}
                          >
                            <ClipboardCheck className="w-4 h-4 mr-2 text-yellow-600" />
                            Отменить готовность
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleReady(r)}
                            disabled={loadingId === r.id}
                          >
                            <ClipboardCheck className="w-4 h-4 mr-2 text-sky-600" />
                            Готово
                          </DropdownMenuItem>
                        )}
                      <DropdownMenuItem onClick={() => setEditRepair(r)}>
                        <Pencil className="w-4 h-4 mr-2 text-blue-600" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {editRepair && (
        <EditRepairModal
          repair={editRepair}
          onClose={() => setEditRepair(null)}
          onSave={onRefresh}
        />
      )}
    </div>
  )
}
