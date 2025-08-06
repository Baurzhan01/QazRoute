"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import type { BusRow, CandidateSource } from "../../hooks/useReplacementData"

const sourceConfig: Record<CandidateSource, { label: string; color: string }> = {
  reserve: { label: "Резерв", color: "bg-yellow-50" },
  order: { label: "С заказов", color: "bg-pink-50" },
  repair: { label: "С планового ремонта", color: "bg-orange-50" },
  assignment: { label: "С маршрута", color: "bg-purple-50" },
  freeBus: { label: "Свободный автобус", color: "bg-blue-50" },
  freeDriver: { label: "Свободный водитель", color: "bg-green-50" },
}

interface Props {
  buses: BusRow[]
  selectedBus: BusRow | null
  onSelectBus: (bus: BusRow) => void
  onConfirmReplace: () => void
}

export default function BusTable({
  buses,
  selectedBus,
  onSelectBus,
  onConfirmReplace,
}: Props) {
  const [search, setSearch] = useState("")

  const filtered = buses.filter((b) => {
    const q = search.toLowerCase()
    return (
      b.garageNumber?.toLowerCase().includes(q) ||
      b.govNumber?.toLowerCase().includes(q) ||
      sourceConfig[b.source].label.toLowerCase().includes(q)
    )
  })

  return (
    <div className="mt-4">
      <Input
        placeholder="Поиск автобуса..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2"
      />
      <div className="max-h-[250px] overflow-y-auto border rounded">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="border px-2 py-1">№</th>
              <th className="border px-2 py-1">Источник</th>
              <th className="border px-2 py-1">Гараж</th>
              <th className="border px-2 py-1">Гос. №</th>
              <th className="border px-2 py-1">Статус</th>
              <th className="border px-2 py-1">Выбор</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => {
              const isSelected =
                selectedBus?.id === b.id && selectedBus?.source === b.source
              return (
                <tr
                  key={b.id + b.source}
                  className={`${sourceConfig[b.source].color} cursor-pointer hover:bg-blue-50 ${
                    isSelected ? "bg-green-100" : ""
                  }`}
                  onClick={() => onSelectBus(b)}
                >
                  <td className="border px-2 py-1 text-center">{i + 1}</td>
                  <td className="border px-2 py-1">
                    {sourceConfig[b.source].label}
                  </td>
                  <td className="border px-2 py-1">{b.garageNumber || "—"}</td>
                  <td className="border px-2 py-1">{b.govNumber || "—"}</td>
                  <td className="border px-2 py-1">{b.status || "—"}</td>
                  <td className="border px-2 py-1 text-center">
                    {isSelected && (
                      <CheckCircle2 className="text-green-600 w-4 h-4" />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Кнопка замены */}
      <div className="flex justify-end mt-2">
        <Button
          onClick={onConfirmReplace}
          disabled={!selectedBus}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Заменить выбранный автобус
        </Button>
      </div>
    </div>
  )
}