"use client"

import type { AssignmentReplacement } from "@/types/releasePlanTypes"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import { CheckCircle2, User, BusFront } from "lucide-react"
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
  onSelect: (driver: DisplayDriver | null, bus: DisplayBus | null, shift?: number) => void
  search: string
  selectedRowKey: string | null
  setSelectedRowKey: (key: string | null) => void
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
      const tab1 = typeof (r.firstDriver as any)?.serviceNumber === "string"
        ? (r.firstDriver as any).serviceNumber.toLowerCase()
        : ""
      const tab2 = typeof (r.secondDriver as any)?.serviceNumber === "string"
        ? (r.secondDriver as any).serviceNumber.toLowerCase()
        : ""
      const garage = r.bus?.garageNumber?.toLowerCase() || ""
      const gov = r.bus?.govNumber?.toLowerCase() || ""

      return (
        fullName1.includes(q) ||
        fullName2.includes(q) ||
        tab1.includes(q) ||
        tab2.includes(q) ||
        garage.includes(q) ||
        gov.includes(q)
      )
    })
  }, [items, search])

  return (
    <TooltipProvider>
      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-sky-100 text-sky-800">
              <th className="border px-2 py-1">№</th>
              <th className="border px-2 py-1">ФИО</th>
              <th className="border px-2 py-1">Таб. номер</th>
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
              const bus = r.bus

              const renderDriverRow = (
                driver: AssignmentReplacement["firstDriver"] | AssignmentReplacement["secondDriver"],
                shift: number
              ) => {
                const rowKey = `r-${r.routeNumber}-e${r.exitNumber}-s${shift}`
                const isRowSelected = selectedRowKey === rowKey
                const hasBus = !!bus
                const hasDriver = !!driver
                const rowColor = !hasBus && !hasDriver
                  ? "bg-orange-100"
                  : !hasDriver
                  ? "bg-red-50"
                  : !hasBus
                  ? "bg-yellow-50"
                  : ""

                const displayDriver: DisplayDriver | null = driver?.id
                  ? {
                      id: driver.id,
                      fullName: driver.fullName,
                      serviceNumber:
                        typeof (driver as any)?.serviceNumber === "string"
                          ? (driver as any).serviceNumber
                          : "",
                      driverStatus: "OnWork",
                    }
                  : null

                const displayBus: DisplayBus | null = bus?.id
                  ? {
                      id: bus.id,
                      garageNumber: bus.garageNumber ?? "",
                      govNumber: bus.govNumber ?? "",
                      status: "Reserve",
                    }
                  : null

                const isSelectable = !!displayDriver // можем выбирать только если есть водитель

                return (
                  <tr
                    key={rowKey}
                    className={`cursor-pointer hover:bg-sky-50 ${isRowSelected ? "bg-green-100" : rowColor}`}
                    onClick={() => {
                      if (!isSelectable) return
                      if (isRowSelected) {
                        console.log("❌ Сняли выбор", rowKey)
                        onSelect(null, null, undefined)
                        setSelectedRowKey(null)
                      } else {
                        console.log("✅ Выбрали", { displayDriver, displayBus, shift })
                        onSelect(displayDriver, displayBus, shift)
                        setSelectedRowKey(rowKey)
                      }
                    }}
                  >
                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                    <td className="border px-2 py-1 flex items-center gap-1">
                      {!hasDriver && <User className="w-4 h-4 text-muted-foreground" />}
                      {driver?.fullName ?? (
                        <span className="text-muted-foreground italic">Нет водителя</span>
                      )}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {typeof (driver as any)?.serviceNumber === "string"
                        ? (driver as any).serviceNumber
                        : "—"}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {driver?.convoyNumber ?? "—"}
                    </td>
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
                    <td className="border px-2 py-1 flex items-center justify-center gap-1">
                      {!hasBus && <BusFront className="w-4 h-4 text-muted-foreground" />}
                      {bus?.garageNumber ?? (
                        <span className="text-muted-foreground italic">Нет автобуса</span>
                      )}
                    </td>
                    <td className="border px-2 py-1 text-center">{bus?.govNumber ?? "—"}</td>
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

              const rows = []
              if (r.firstDriver || r.bus) rows.push(renderDriverRow(r.firstDriver ?? null, 1))
              if (r.secondDriver || r.bus) rows.push(renderDriverRow(r.secondDriver ?? null, 2))
              return rows
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  )
}
