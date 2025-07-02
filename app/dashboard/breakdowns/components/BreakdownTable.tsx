"use client"

import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"
import { cn } from "@/lib/utils"

interface BreakdownTableProps {
  repairs: RouteExitRepairDto[]
}

function shortenName(fullName: string): string {
  const parts = fullName.split(" ")
  if (parts.length < 3) return fullName
  return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`
}

export default function BreakdownTable({ repairs }: BreakdownTableProps) {
  // Правильное определение повторных заездов
  const seenBusIds = new Set<string>()
  const repeatEntryIds = new Set<string>()

  repairs.forEach((r) => {
    const busId = r.bus?.id
    if (!busId) return
    if (seenBusIds.has(busId)) {
      repeatEntryIds.add(r.id)
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
            <th className="p-2 border">Маршрут</th>
            <th className="p-2 border">ФИО водителя</th>
            <th className="p-2 border">Гос. № (Гаражный №)</th>
            <th className="p-2 border">Причина</th>
            <th className="p-2 border">Начало ремонта</th>
            <th className="p-2 border">Окончание ремонта</th>
            <th className="p-2 border">Дата завершения</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => {
            const isRepeat = repeatEntryIds.has(r.id)
            const isLongTerm = r.repairType === "LongTerm"

            // Заливка строки по логике
            const rowClass = cn(
              "border",
              r.endRepairTime && "bg-green-100",
              isLongTerm && "bg-red-100",
              isRepeat && "bg-yellow-100"
            )

            const reasonLabels = []
            if (isLongTerm) reasonLabels.push("• Длительный ремонт")
            if (isRepeat) reasonLabels.push("• Повторный заезд")
            const reason = `${r.text || "–"} ${reasonLabels.join(" ")}`.trim()

            return (
              <tr key={r.id} className={rowClass}>
                <td className="p-2 border text-center">{idx + 1}</td>
                <td className="p-2 border text-center">{r.startDate || "–"}</td>
                <td className="p-2 border text-center">{r.route?.number ?? "–"}</td>
                <td className="p-2 border">
                  {r.driver
                    ? `${shortenName(r.driver.fullName)} (${r.driver.serviceNumber})`
                    : "–"}
                </td>
                <td className="p-2 border text-center">
                  {r.bus?.govNumber && r.bus?.garageNumber
                    ? `${r.bus.govNumber} (${r.bus.garageNumber})`
                    : "–"}
                </td>
                <td className="p-2 border text-red-600 font-medium">{reason}</td>
                <td className="p-2 border text-center">
                  {r.startRepairTime ? r.startRepairTime.slice(0, 5) : "–"}
                </td>
                <td className="p-2 border text-center">
                  {r.endRepairTime ? r.endRepairTime.slice(0, 5) : "–"}
                </td>
                <td className="p-2 border text-center">{r.endRepairDate || "–"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {repairs.length === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Нет данных за выбранный период
        </p>
      )}
    </div>
  )
}
