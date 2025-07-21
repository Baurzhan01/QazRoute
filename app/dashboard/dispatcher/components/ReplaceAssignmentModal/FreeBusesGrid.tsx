// ReplaceAssignmentModal/FreeBusesGrid.tsx

import type { DisplayBus } from "@/types/bus.types"

interface Props {
  buses: DisplayBus[]
  selectedBus: DisplayBus | null
  onSelect: (bus: DisplayBus) => void
  search: string
}

export default function FreeBusesGrid({ buses, selectedBus, onSelect, search }: Props) {
  const filtered = buses.filter(
    (b) =>
      b.garageNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.govNumber.toLowerCase().includes(search.toLowerCase())
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
