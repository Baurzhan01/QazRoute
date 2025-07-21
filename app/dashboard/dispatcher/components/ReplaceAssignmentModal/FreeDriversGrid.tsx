// ReplaceAssignmentModal/FreeDriversGrid.tsx

import type { DisplayDriver } from "@/types/driver.types"

interface Props {
  drivers: DisplayDriver[]
  selectedDriver: DisplayDriver | null
  onSelect: (driver: DisplayDriver) => void
  search: string
}

export default function FreeDriversGrid({ drivers, selectedDriver, onSelect, search }: Props) {
  const filtered = drivers.filter(
    (d) =>
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.serviceNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid grid-cols-2 gap-2 mt-3 max-h-[400px] overflow-y-auto">
      {filtered.map((d) => (
        <div
          key={d.id}
          className={`p-2 border rounded cursor-pointer hover:bg-gray-100 ${
            selectedDriver?.id === d.id ? "bg-green-100" : ""
          }`}
          onClick={() => onSelect(d)}
        >
          <div className="font-semibold">{d.fullName}</div>
          <div className="text-sm text-gray-600">Таб №: {d.serviceNumber}</div>
        </div>
      ))}
    </div>
  )
}
