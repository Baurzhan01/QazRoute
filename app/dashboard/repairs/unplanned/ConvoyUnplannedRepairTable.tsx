"use client"

import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

interface Props {
  repairs: RouteExitRepairDto[]
}

function shortenName(fullName: string): string {
  const parts = fullName.split(" ")
  if (parts.length < 3) return fullName
  return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`
}

export default function ConvoyUnplannedRepairTable({ repairs }: Props) {
  return (
    <div className="overflow-x-auto max-h-[70vh]">
      <table className="w-full text-sm border">
        <thead className="sticky top-0 z-10 bg-white shadow">
          <tr className="bg-gray-100">
            <th className="p-2 border">№</th>
            <th className="p-2 border">Маршрут</th>
            <th className="p-2 border">ФИО водителя</th>
            <th className="p-2 border">Гос. № (Гаражный №)</th>
            <th className="p-2 border">Причина</th>
            <th className="p-2 border">Начало ремонта</th>
            <th className="p-2 border">Окончание ремонта</th>
            <th className="p-2 border">Дата завершения</th>
            <th className="p-2 border">Пробег</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => (
            <tr key={r.id} className={`border ${r.endRepairTime ? "bg-green-100" : ""}`}>
              <td className="p-2 border text-center">{idx + 1}</td>
              <td className="p-2 border text-center">{r.route?.number ?? "–"}</td>
              <td className="p-2 border">
                {r.driver
                  ? `${shortenName(r.driver.fullName)} (${r.driver.serviceNumber})`
                  : "–"}
              </td>
              <td className="p-2 border text-center">
                {r.bus ? `${r.bus.govNumber} (${r.bus.garageNumber})` : "–"}
              </td>
              <td className="p-2 border text-red-600 font-medium">{r.text || "–"}</td>
              <td className="p-2 border text-center">
                {r.startRepairTime ? r.startRepairTime.slice(0, 5) : "–"}
              </td>
              <td className="p-2 border text-center">
                {r.endRepairTime ? r.endRepairTime.slice(0, 5) : "–"}
              </td>
              <td className="p-2 border text-center">{r.endRepairDate || "–"}</td>
              <td className="p-2 border text-center">{r.mileage != null ? r.mileage : "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {repairs.length === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Нет данных за выбранную дату
        </p>
      )}
    </div>
  )
}
