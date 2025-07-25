"use client"

import { CheckCircle2 } from "lucide-react"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"

interface OrderReserve {
  id: string
  driverId: string
  driverFullName: string
  driverTabNumber: string
  garageNumber: string
  govNumber: string
}

interface Props {
  items: OrderReserve[]
  selectedDriver: DisplayDriver | null
  selectedBus: DisplayBus | null
  onSelect: (driver: DisplayDriver, bus: DisplayBus) => void
  search: string
}

export default function OrderReplacementList({
  items,
  selectedDriver,
  selectedBus,
  onSelect,
  search,
}: Props) {
  const isSelected = (item: OrderReserve) =>
    selectedDriver?.id === item.driverId && selectedBus?.govNumber === item.govNumber

  const q = search.toLowerCase()

  const filtered = items.filter((item) => {
    const fullName = item.driverFullName?.toLowerCase() || ""
    const tabNumber = item.driverTabNumber?.toLowerCase() || ""
    const gov = item.govNumber?.toLowerCase() || ""
    const garage = item.garageNumber?.toLowerCase() || ""

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
          {filtered.map((item, index) => {
            const isItemSelected = isSelected(item)

            return (
              <tr
                key={`${item.id}-${index}`}
                className={`cursor-pointer hover:bg-blue-50 ${
                  isItemSelected ? "bg-green-100" : ""
                }`}
                onClick={() => {
                  onSelect(
                    {
                      id: item.driverId,
                      fullName: item.driverFullName,
                      serviceNumber: item.driverTabNumber,
                      driverStatus: "OnWork",
                    },
                    {
                      id: "", // у заказных автобусов ID может быть пустым
                      garageNumber: item.garageNumber,
                      govNumber: item.govNumber,
                      status: "Reserve",
                    }
                  )
                }}
              >
                <td className="border px-2 py-1 text-center">{index + 1}</td>
                <td className="border px-2 py-1">{item.driverFullName}</td>
                <td className="border px-2 py-1 text-center">{item.driverTabNumber}</td>
                <td className="border px-2 py-1 text-center">{item.garageNumber}</td>
                <td className="border px-2 py-1 text-center">{item.govNumber}</td>
                <td className="border px-2 py-1 text-center">
                  {isItemSelected && (
                    <div className="flex items-center gap-1 text-green-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Выбрано</span>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
