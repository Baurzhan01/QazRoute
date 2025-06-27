import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, Check } from "lucide-react"
import { routeExitRepairService } from "@/service/routeExitRepairService"

interface UnscheduledRepairTableProps {
  repairs: any[]
  onRefresh?: () => void
}

function shortenName(fullName: string): string {
  const parts = fullName.split(" ")
  if (parts.length < 3) return fullName
  return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`
}

export default function UnscheduledRepairTable({ repairs, onRefresh }: UnscheduledRepairTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleFinish = async (repair: any) => {
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

  const handleDelete = async (repairId: string) => {
    if (!confirm("Удалить запись о ремонте?")) return

    const result = await routeExitRepairService.delete(repairId)
    if (result.isSuccess) onRefresh?.()
    else toast({ title: "Ошибка при удалении", description: result.error || "", variant: "destructive" })
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
            <th className="p-2 border">Пробег</th>
            <th className="p-2 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => (
            <tr key={r.id} className={`border ${r.andTime ? "bg-green-100" : ""}`}>
              <td className="p-2 border text-center">{idx + 1}</td>
              <td className="p-2 border text-center">{r.startDate || "-"}</td>
              <td className="p-2 border text-center">{r.startTime || "-"}</td>
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
              <td className="p-2 border text-red-600 font-medium">{r.text}</td>
              <td className="p-2 border text-center">{r.startRepairTime || "–"}</td>
              <td className="p-2 border text-center">{r.endRepairTime || "–"}</td>
              <td className="p-2 border text-center">{r.endRepairDate || "–"}</td>
              <td className="p-2 border text-center">{r.andTime || "–"}</td>
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
                    <DropdownMenuItem onClick={() => handleDelete(r.id)}>
                      <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                      Удалить
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
