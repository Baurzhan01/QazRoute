import type { AssignmentReplacement } from "@/types/releasePlanTypes"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import { CheckCircle2, XCircle } from "lucide-react"
import { useMemo } from "react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"

interface AssignmentReplacementListProps {
  items: AssignmentReplacement[]
  selectedDriver: DisplayDriver | null
  selectedBus: DisplayBus | null
  onSelect: (driver: DisplayDriver | null, bus: DisplayBus | null) => void
  search: string
//   selectedRowIndex: number | null
  selectedRowKey: string | null
  setSelectedRowKey: (key: string | null) => void
//   setSelectedRowIndex: (index: number | null) => void
}

export default function AssignmentReplacementList({
  items,
  selectedDriver,
  selectedBus,
  onSelect,
  search,
  selectedRowKey,
  setSelectedRowKey,
}: AssignmentReplacementListProps) {
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return items.filter((r) => {
      const fullName1 = r.firstDriver?.fullName?.toLowerCase() || ""
      const fullName2 = r.secondDriver?.fullName?.toLowerCase() || ""
      const garage = r.bus?.garageNumber?.toLowerCase() || ""
      const gov = r.bus?.govNumber?.toLowerCase() || ""
      return (
        fullName1.includes(q) ||
        fullName2.includes(q) ||
        garage.includes(q) ||
        gov.includes(q)
      )
    })
  }, [items, search])

  const isRemoved = (driver: any) =>
    driver?.status?.toLowerCase() === "removed" ||
    driver?.driverStatus?.toLowerCase() === "removed" ||
    driver?.isRemoved === true

  return (
    <TooltipProvider>
      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-sky-100 text-sky-800">
              <th className="border px-2 py-1">№</th>
              <th className="border px-2 py-1">ФИО</th>
              <th className="border px-2 py-1">Колонна</th>
              <th className="border px-2 py-1">Смена</th>
              <th className="border px-2 py-1">Маршрут</th>
              <th className="border px-2 py-1">Выход</th>
              <th className="border px-2 py-1">Гараж</th>
              <th className="border px-2 py-1">Гос. номер</th>
              <th className="border px-2 py-1">Выбор</th>
            </tr>
          </thead>
          <tbody>
            {filtered.flatMap((r, index) => {
              const rows = []
              const bus = r.bus

              const renderRow = (
                driver: AssignmentReplacement["firstDriver"] | AssignmentReplacement["secondDriver"],
                shift: number
              ) => {
                if (!driver || !bus) return null

                const rowKey = `${bus.id}-${driver.id}-${shift}`
                const isRowSelected = selectedRowKey === rowKey

                const removed = isRemoved(driver)
                

                return (
                  <tr
                    key={`row-${bus.id ?? index}-${driver.id ?? shift}-${shift}`}
                    className={`cursor-pointer hover:bg-sky-50 ${
                      isRowSelected ? "bg-green-100" : removed ? "bg-red-50" : ""
                    }`}
                    onClick={() => {
                        if (isRowSelected) {
                          onSelect(null, null)
                          setSelectedRowKey(null)
                        } else {
                          onSelect(
                            { id: driver.id!, fullName: driver.fullName!, serviceNumber: "", driverStatus: "OnWork" },
                            { id: bus.id!, garageNumber: bus.garageNumber!, govNumber: bus.govNumber!, status: "OnWork" }
                          )
                          setSelectedRowKey(rowKey)
                        }
                      }}
                      
                  >
                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                    <td className="border px-2 py-1">
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{driver.fullName}</span>
                          </TooltipTrigger>
                          <TooltipContent>Смена {shift}</TooltipContent>
                        </Tooltip>
                        {removed && (
                          <span className="text-red-500 text-xs flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Снят
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border px-2 py-1 text-center">{driver.convoyNumber ?? "-"}</td>
                    <td className="border px-2 py-1 text-center">
                      <span
                        className={`inline-block w-5 text-white text-xs px-1 rounded ${
                          shift === 1 ? "bg-blue-500" : "bg-orange-500"
                        }`}
                      >
                        {shift}
                      </span>
                    </td>
                    <td className="border px-2 py-1 text-center">{r.routeNumber}</td>
                    <td className="border px-2 py-1 text-center">{r.exitNumber}</td>
                    <td className="border px-2 py-1 text-center">{bus.garageNumber}</td>
                    <td className="border px-2 py-1 text-center">{bus.govNumber}</td>
                    <td className="border px-2 py-1 text-center">
                      {isRowSelected && (
                        <div className="flex items-center gap-1 text-green-700 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Выбрано</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              }

              if (r.firstDriver) rows.push(renderRow(r.firstDriver, 1))
              if (r.secondDriver) rows.push(renderRow(r.secondDriver, 2))

              return rows
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  )
}
