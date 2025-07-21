// ReplaceAssignmentModal/ReserveReplacementTable.tsx

import { CheckCircle2 } from "lucide-react"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import type { ReserveReplacementCandidate } from "@/types/releasePlanTypes"

interface Props {
  reserve: ReserveReplacementCandidate[]
  selectedDriver: DisplayDriver | null
  selectedBus: DisplayBus | null
  onSelect: (driver: DisplayDriver, bus: DisplayBus) => void
  search: string
}

export default function ReserveReplacementTable({ reserve, selectedDriver, selectedBus, onSelect, search }: Props) {
  const isSelected = (r: ReserveReplacementCandidate) =>
    selectedDriver?.id === r.driverId && selectedBus?.id === r.busId

  const filteredReserve = reserve.filter((r) => {
    const fullName = r.driverFullName?.toLowerCase() || ""
    const tabNumber = r.driverTabNumber?.toLowerCase() || ""
    const garage = r.garageNumber?.toLowerCase() || ""
    const gov = r.govNumber?.toLowerCase() || ""
    const query = search.toLowerCase()
    return (
      fullName.includes(query) ||
      tabNumber.includes(query) ||
      garage.includes(query) ||
      gov.includes(query)
    )
  })

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-sky-100 text-sky-800">
            <th className="border px-2 py-1">№</th>
            <th className="border px-2 py-1">ФИО</th>
            <th className="border px-2 py-1">Таб. номер</th>
            <th className="border px-2 py-1">Гараж</th>
            <th className="border px-2 py-1">Гос. номер</th>
            <th className="border px-2 py-1">Причина</th>
            <th className="border px-2 py-1">Выбор</th>
          </tr>
        </thead>
        <tbody>
          {filteredReserve.map((r, index) => {
            const isRemoved = r.description?.toLowerCase().includes("снят с маршрута")
            const isRowSelected = isSelected(r)
            const isGoneToRoute =
              !isRemoved &&
              !reserve.some((entry) => entry.driverId === r.driverId && entry.busId === r.busId)

            return (
              <tr
                key={r.id}
                onClick={() => {
                  if (!r.driverId || !r.busId) return
                  onSelect(
                    {
                      id: r.driverId,
                      fullName: r.driverFullName,
                      serviceNumber: r.driverTabNumber,
                      driverStatus: "OnWork",
                    },
                    {
                      id: r.busId,
                      garageNumber: r.garageNumber,
                      govNumber: r.govNumber,
                      status: "Reserve",
                    }
                  )
                }}
                className={`cursor-pointer hover:bg-sky-50 ${
                  isRowSelected ? "bg-green-100" :
                  isRemoved ? "bg-red-50" :
                  isGoneToRoute ? "bg-red-100/50" : ""
                }`}
              >
                <td className="border px-2 py-1 text-center">{index + 1}</td>
                <td className="border px-2 py-1">{r.driverFullName}</td>
                <td className="border px-2 py-1 text-center">{r.driverTabNumber}</td>
                <td className="border px-2 py-1 text-center">{r.garageNumber}</td>
                <td className="border px-2 py-1 text-center">{r.govNumber}</td>
                <td className="border px-2 py-1">{r.description}</td>
                <td className="border px-2 py-1 text-center">
                  {isRowSelected && (
                    <div className="flex items-center gap-1 text-yellow-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Замена</span>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="text-xs text-muted-foreground mt-1 px-1">
        <div>
          <span className="inline-block w-3 h-3 bg-green-100 border mr-2 align-middle" /> выбрана строка для замены
        </div>
        <div>
          <span className="inline-block w-3 h-3 bg-red-50 border mr-2 align-middle" /> снят(а) с маршрута
        </div>
      </div>
    </div>
  )
}
