// ReplaceAssignmentModal/OrderReplacementList.tsx

import { CheckCircle2 } from "lucide-react"
import type { ReserveAssignment } from "@/types/releasePlanTypes"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"

interface Props {
  items: ReserveAssignment[]
  selectedDriver: DisplayDriver | null
  selectedBus: DisplayBus | null
  onSelect: (driver: DisplayDriver, bus: DisplayBus) => void
  search: string
}

export default function OrderReplacementList({ items, selectedDriver, selectedBus, onSelect, search }: Props) {
  const isSelected = (item: ReserveAssignment) =>
    selectedDriver?.id === item.driver.id && selectedBus?.govNumber === item.govNumber

  const filtered = items.filter((item) => {
    const fullName = item.driver.fullName.toLowerCase()
    const tabNumber = item.driver.serviceNumber.toLowerCase()
    const gov = item.govNumber.toLowerCase()
    const garage = item.garageNumber.toLowerCase()
    const q = search.toLowerCase()

    return (
      fullName.includes(q) ||
      tabNumber.includes(q) ||
      gov.includes(q) ||
      garage.includes(q)
    )
  })

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-blue-100 text-blue-800">
            <th className="border px-2 py-1">№</th>
            <th className="border px-2 py-1">ФИО</th>
            <th className="border px-2 py-1">Таб. номер</th>
            <th className="border px-2 py-1">Гараж</th>
            <th className="border px-2 py-1">Гос. номер</th>
            <th className="border px-2 py-1">Выбор</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item, index) => (
            <tr
              key={item.id}
              className={`cursor-pointer hover:bg-blue-50 ${
                isSelected(item) ? "bg-green-100" : ""
              }`}
              onClick={() => {
                onSelect(
                  {
                    id: item.driver.id,
                    fullName: item.driver.fullName,
                    serviceNumber: item.driver.serviceNumber,
                    driverStatus: "OnWork",
                  },
                  {
                    id: "",
                    garageNumber: item.garageNumber,
                    govNumber: item.govNumber,
                    status: "Reserve",
                  }
                )
              }}
            >
              <td className="border px-2 py-1 text-center">{index + 1}</td>
              <td className="border px-2 py-1">{item.driver.fullName}</td>
              <td className="border px-2 py-1 text-center">{item.driver.serviceNumber}</td>
              <td className="border px-2 py-1 text-center">{item.garageNumber}</td>
              <td className="border px-2 py-1 text-center">{item.govNumber}</td>
              <td className="border px-2 py-1 text-center">
                {isSelected(item) && (
                  <div className="flex items-center gap-1 text-green-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Выбрано</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
