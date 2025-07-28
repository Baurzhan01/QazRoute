// ReplaceAssignmentModal/FreeBusesGrid.tsx

import type { DisplayBus } from "@/types/bus.types"
import type { ReserveReplacementCandidate } from "@/types/releasePlanTypes" // было ReserveAssignment

interface Props {
  buses: DisplayBus[]
  selectedBus: DisplayBus | null
  onSelect: (bus: DisplayBus) => void
  search: string
  reserveAssignments?: ReserveReplacementCandidate[] // ✅ заменили тип
}

export default function FreeBusesGrid({
  buses,
  selectedBus,
  onSelect,
  search,
  reserveAssignments = [],
}: Props) {
  // Преобразуем резерв в DisplayBus[]
  const reserveBuses: DisplayBus[] = reserveAssignments.map((r) => ({
    id: r.busId,
    garageNumber: r.garageNumber,
    govNumber: r.govNumber,
  }))

  // Объединяем списки, исключая дубли по id
  const allBuses: DisplayBus[] = [
    ...buses,
    ...reserveBuses.filter((rb) => !buses.some((b) => b.id === rb.id)),
  ]

  // Поиск по гаражному или гос. номеру
  const filtered = allBuses.filter(
    (b) =>
      (b.garageNumber?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (b.govNumber?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )  

  return (
    <div className="grid grid-cols-2 gap-2 mt-3 max-h-[400px] overflow-y-auto">
      {filtered.map((b) => (
        <div
          key={b.id}
          className={`p-2 border rounded cursor-pointer hover:bg-gray-100 ${
            selectedBus?.id === b.id ? "bg-blue-100" : ""
          }`}
          onClick={() => onSelect(b)}
        >
          <div className="font-semibold">{b.garageNumber}</div>
          <div className="text-sm text-gray-600">{b.govNumber}</div>
        </div>
      ))}
    </div>
  )
}
