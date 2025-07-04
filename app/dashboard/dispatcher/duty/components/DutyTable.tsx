"use client"

import { DispatchDutyRecord } from "@/types/releasePlanTypes"
import { useMemo } from "react"

interface Props {
  data: DispatchDutyRecord[]
  date: string
  loading: boolean
}

function formatShortName(fullName?: string): string {
  if (!fullName) return "—"
  const parts = fullName.trim().split(" ")
  const [last, first, patronymic] = parts
  const initials = [first, patronymic]
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() + ".")
    .join("")
  return `${last} ${initials}`
}

export default function DutyTable({ data }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, DispatchDutyRecord[]>()
    data.forEach((r) => {
      const route = r.routeNumber || "—"
      if (!map.has(route)) map.set(route, [])
      map.get(route)?.push(r)
    })

    // Сортировка маршрутов с поддержкой чисел и букв (например, 4а, 10)
    return Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b, "ru", { numeric: true })
    )
  }, [data])

  return (
    <div className="overflow-auto rounded-md border print-export">
      <table className="w-full text-sm text-gray-800 border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border text-center">Маршрут</th>
            <th className="p-2 border text-center">Маршрут</th>
            <th className="p-2 border text-center">Выход</th>
            <th className="p-2 border text-center">Гаражный №</th>
            <th className="p-2 border text-center">Гос. №</th>
            <th className="p-2 border text-center">Марка</th>
            <th className="p-2 border text-center">ФИО водителя</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(([routeNumber, records], routeIdx) => {
            const bgColor = routeIdx % 2 === 0 ? "#dceeff" : "#fff3d6"

            return records.map((r, idx) => (
              <tr key={`${routeNumber}-${r.busLineNumber}-${idx}`} style={{ backgroundColor: bgColor }}>
                {/* Первая колонка: сгруппированный маршрут с rowspan */}
                {idx === 0 && (
                  <td
                    className="p-2 border text-center font-bold align-middle"
                    rowSpan={records.length}
                    style={{ verticalAlign: "middle", fontWeight: 600 }}
                  >
                    {routeNumber}
                  </td>
                )}
                {/* Вторая колонка: маршрут на каждой строке */}
                <td className="p-2 border text-center">{routeNumber}</td>
                <td className="p-2 border text-center">{r.busLineNumber}</td>
                <td className="p-2 border text-center">{r.garageNumber || "—"}</td>
                <td className="p-2 border text-center">{r.govNumber || "—"}</td>
                <td className="p-2 border text-center">{r.busBrand || "—"}</td>
                <td className="p-2 border text-center">
                  {formatShortName(r.driverFullName)}
                </td>
              </tr>
            ))
          })}
        </tbody>
      </table>
    </div>
  )
}
