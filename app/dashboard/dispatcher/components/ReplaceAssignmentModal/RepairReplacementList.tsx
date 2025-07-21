import type { RepairDto } from "@/types/repair.types"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"

interface Props {
  items: RepairDto[]
  selectedDriver: DisplayDriver | null
  selectedBus: DisplayBus | null
  onSelect: (driver: DisplayDriver, bus: DisplayBus) => void
  search: string
}

export default function RepairReplacementList({
  items,
  selectedDriver,
  selectedBus,
  onSelect,
  search,
}: Props) {
  const filtered = items.filter((item) => {
    const fullName = item.driver?.fullName?.toLowerCase() || ""
    const tabNumber = item.driver?.serviceNumber?.toLowerCase() || ""
    const garage = item.bus?.garageNumber?.toLowerCase() || ""
    const gov = item.bus?.govNumber?.toLowerCase() || ""
    return (
      fullName.includes(search.toLowerCase()) ||
      tabNumber.includes(search.toLowerCase()) ||
      garage.includes(search.toLowerCase()) ||
      gov.includes(search.toLowerCase())
    )
  })

  const isSelected = (item: RepairDto) =>
    selectedDriver?.id === item.driver?.id && selectedBus?.id === item.bus?.id

  return (
    <div className="max-h-[400px] overflow-y-auto text-sm">
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-sky-100 text-sky-800">
            <th className="border px-2 py-1">ФИО</th>
            <th className="border px-2 py-1">Таб. номер</th>
            <th className="border px-2 py-1">Гараж</th>
            <th className="border px-2 py-1">Гос. номер</th>
            <th className="border px-2 py-1">Выбор</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr
              key={`${item.driver?.id}-${item.bus?.id}`}
              onClick={() => {
                if (!item.driver || !item.bus) return
                onSelect(
                  {
                    id: item.driver.id,
                    fullName: item.driver.fullName,
                    serviceNumber: item.driver.serviceNumber,
                    driverStatus: "OnWork",
                  },
                  {
                    id: item.bus.id,
                    garageNumber: item.bus.garageNumber,
                    govNumber: item.bus.govNumber,
                    status: "Reserve",
                  }
                )
              }}
              className={`cursor-pointer hover:bg-sky-50 ${
                isSelected(item) ? "bg-green-100" : ""
              }`}
            >
              <td className="border px-2 py-1">{item.driver?.fullName}</td>
              <td className="border px-2 py-1 text-center">{item.driver?.serviceNumber}</td>
              <td className="border px-2 py-1 text-center">{item.bus?.garageNumber}</td>
              <td className="border px-2 py-1 text-center">{item.bus?.govNumber}</td>
              <td className="border px-2 py-1 text-center">
                {isSelected(item) && <span className="text-green-700 font-semibold">✓</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
