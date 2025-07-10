"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportUnscheduledRepairs } from "@/lib/excel/exportUnscheduledRepairs"
import { cn } from "@/lib/utils"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

interface UnscheduledRepairTableProps {
  repairs: RouteExitRepairDto[]
}

function shortenName(fullName: string): string {
  const parts = fullName.split(" ")
  if (parts.length < 3) return fullName
  return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`
}

export default function UnscheduledRepairTable({ repairs }: UnscheduledRepairTableProps) {
  const [repeatRepairIds, setRepeatRepairIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const busMap = new Map<string, RouteExitRepairDto[]>()
  
    repairs.forEach((r) => {
      const busId = r.bus?.id
      if (!busId) return
      if (!busMap.has(busId)) {
        busMap.set(busId, [])
      }
      busMap.get(busId)!.push(r)
    })
  
    const repeats = new Set<string>()
    busMap.forEach((entries) => {
      if (entries.length > 1) {
        // добавить только 2ю и далее записи
        entries.slice(1).forEach((r) => repeats.add(r.id))
      }
    })
  
    setRepeatRepairIds(repeats)
  }, [repairs])

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
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => {
            const busId = r.bus?.id
            const isRepeat = repeatRepairIds.has(r.id)
            const isLong = r.repairType === "LongTerm"
            const isFinished = Boolean(r.andTime)
            const isReady = r.isReady === true

            // 🟢 Приоритет цвета: завершено > длительный > повторный
            let rowBgColor = ""
              if (isFinished) {
                rowBgColor = "bg-green-100"
              } else if (isReady) {
                rowBgColor = "bg-sky-100"
              } else if (isLong) {
                rowBgColor = "bg-red-100"
              } else if (isRepeat) {
                rowBgColor = "bg-yellow-100"
              }

            return (
              <tr key={r.id} className={cn("border", rowBgColor)}>
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
                    : "–"}
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
                  {isRepeat && <span className="text-xs text-yellow-700"> • Повторный заезд</span>}
                  {isLong && <span className="text-xs text-red-700"> • Длительный ремонт</span>}
                </td>
                <td className="p-2 border text-center">{r.startRepairTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.endRepairTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.endRepairDate || "–"}</td>
                <td className="p-2 border text-center">{r.andTime?.slice(0, 5) || "–"}</td>
                <td className="p-2 border text-center">{r.mileage ?? "–"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
