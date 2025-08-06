"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, BusFront } from "lucide-react"
import type { CandidateRow, CandidateSource } from "../../hooks/useReplacementData"

const sourceConfig: Record<CandidateSource, { label: string; color: string }> = {
  reserve: { label: "Резерв", color: "bg-yellow-50" },
  order: { label: "С заказов", color: "bg-pink-50" },
  repair: { label: "С планового ремонта", color: "bg-orange-50" },
  assignment: { label: "С маршрута", color: "bg-purple-50" },
  freeBus: { label: "Свободный автобус", color: "bg-blue-50" },
  freeDriver: { label: "Свободный водитель", color: "bg-green-50" },
}

interface Props {
  candidates: CandidateRow[]
  selectedCandidate: CandidateRow | null
  onSelectCandidate: (candidate: CandidateRow) => void
  onBusReplaceClick: (candidate: CandidateRow) => void
}

export default function CandidateTable({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  onBusReplaceClick,
}: Props) {
  return (
    <div className="max-h-[300px] overflow-y-auto border rounded">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">№</th>
            <th className="border px-2 py-1">Источник</th>
            <th className="border px-2 py-1">ФИО</th>
            <th className="border px-2 py-1">Таб. №</th>
            <th className="border px-2 py-1">Гараж</th>
            <th className="border px-2 py-1">Гос. №</th>
            <th className="border px-2 py-1">Маршрут</th>
            <th className="border px-2 py-1">Выход</th>
            <th className="border px-2 py-1">Выбор</th>
            <th className="border px-2 py-1">Автобус</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, i) => {
            const isSelected =
              selectedCandidate?.id === c.id &&
              selectedCandidate?.source === c.source
            return (
              <tr
                key={c.id + c.source}
                className={`${sourceConfig[c.source].color} cursor-pointer hover:bg-blue-50 ${
                  isSelected ? "bg-green-100" : ""
                }`}
                onClick={() => onSelectCandidate(c)}
              >
                <td className="border px-2 py-1 text-center">{i + 1}</td>
                <td className="border px-2 py-1">
                  {sourceConfig[c.source].label}
                </td>
                <td className="border px-2 py-1">
                  {c.driver?.fullName || "—"}
                </td>
                <td className="border px-2 py-1">
                  {c.driver?.serviceNumber || "—"}
                </td>
                <td className="border px-2 py-1">
                  {c.bus?.garageNumber || "—"}
                </td>
                <td className="border px-2 py-1">
                  {c.bus?.govNumber || "—"}
                </td>
                <td className="border px-2 py-1">
                  {c.routeNumber || "—"}
                </td>
                <td className="border px-2 py-1">
                  {c.exitNumber || "—"}
                </td>
                <td className="border px-2 py-1 text-center">
                  {isSelected && (
                    <CheckCircle2 className="text-green-600 w-4 h-4" />
                  )}
                </td>
                <td className="border px-2 py-1 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onBusReplaceClick(c)
                    }}
                  >
                    <BusFront className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}