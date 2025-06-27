"use client"

import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

interface BreakdownTableProps {
  repairs: RouteExitRepairDto[]
}

function shortenName(fullName: string): string {
  const parts = fullName.split(" ")
  if (parts.length < 3) return fullName
  return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`
}

export default function BreakdownTable({ repairs }: BreakdownTableProps) {
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
          {repairs.map((r, idx) => (
            <tr key={r.id} className="border">
              <td className="p-2 border text-center">{idx + 1}</td>
              <td className="p-2 border text-center">{r.startDate ?? "–"}</td>
              <td className="p-2 border text-center">{r.route?.number ?? "–"}</td>
              <td className="p-2 border">
                {r.driver ? `${shortenName(r.driver.fullName)} (${r.driver.serviceNumber})` : "–"}
              </td>
              <td className="p-2 border text-center">
                {r.bus ? `${r.bus.govNumber} (${r.bus.garageNumber})` : "–"}
              </td>
              <td className="p-2 border text-red-600 font-medium">{r.text || "–"}</td>
              <td className="p-2 border text-center">{r.startRepairTime || "–"}</td>
              <td className="p-2 border text-center">{r.endRepairTime || "–"}</td>
              <td className="p-2 border text-center">{r.endRepairDate || "–"}</td>
            </tr>
          ))}
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
