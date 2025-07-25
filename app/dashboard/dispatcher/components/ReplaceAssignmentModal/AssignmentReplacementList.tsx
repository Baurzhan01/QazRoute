// ✅ Final version of AssignmentReplacementList.tsx with support for Bus replacement dialog
"use client"

import { useMemo, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import type { AssignmentReplacement } from "@/types/releasePlanTypes"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import BusSelectDialog from "./BusSelectDialog"

// ✅ Local extension with ID
type AssignmentReplacementWithId = AssignmentReplacement & {
  dispatchBusLineId: string
}

interface Props {
  items: AssignmentReplacementWithId[]
  selectedDriver: DisplayDriver | null
  selectedBus: DisplayBus | null
  onSelect: (driver: DisplayDriver, bus: DisplayBus, shift: number) => void
  search: string
  reloadAssignmentReplacements: () => void // ✅ добавь это
}

export default function AssignmentReplacementList({
  items,
  selectedDriver,
  selectedBus,
  onSelect,
  search,
  reloadAssignmentReplacements,
}: Props) {
  const [busDialogOpen, setBusDialogOpen] = useState(false)
  const [dialogData, setDialogData] = useState<{
    driverId: string
    convoyId: string
    shift: number
    dispatchBusLineId: string
  } | null>(null)

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return items.filter(({ firstDriver, secondDriver, bus }) => {
      const values = [
        firstDriver?.fullName,
        secondDriver?.fullName,
        bus?.garageNumber,
        bus?.govNumber,
      ].map((val) => val?.toLowerCase() || "")
      return values.some((val) => val.includes(query))
    })
  }, [items, search])

  const isSelected = (driverId?: string, busId?: string) =>
    selectedDriver?.id === driverId && selectedBus?.id === busId

  const handleRowClick = (
    driver: DisplayDriver,
    bus: DisplayBus,
    shift: number,
    convoyId?: string,
    dispatchBusLineId?: string
  ) => {
    // ✅ Сначала визуально выделяем
    onSelect(driver, bus, shift)
  
    // ✅ Затем — если можно — открываем диалог замены автобуса
    if (convoyId && dispatchBusLineId) {
      setDialogData({
        driverId: driver.id,
        convoyId,
        shift,
        dispatchBusLineId,
      })
      setBusDialogOpen(true)
    }
  }  

  const handleBusSelected = (bus: DisplayBus) => {
    if (dialogData) {
      const dummyDriver: DisplayDriver = {
        id: dialogData.driverId,
        fullName: "—",
        serviceNumber: "—",
        driverStatus: "OnWork",
      }
      onSelect(dummyDriver, bus, dialogData.shift)
    }
    setBusDialogOpen(false)
  }

  const renderDriverRow = (
    driver: AssignmentReplacement["firstDriver"] | AssignmentReplacement["secondDriver"],
    item: AssignmentReplacementWithId,
    shift: number,
    index: number
  ) => {
    if (!driver?.id) return null

    const bus: DisplayBus = {
      id: item.bus?.id ?? "",
      garageNumber: item.bus?.garageNumber ?? "—",
      govNumber: item.bus?.govNumber ?? "—",
      status: "OnWork",
    }

    const driverDisplay: DisplayDriver = {
      id: driver.id,
      fullName: driver.fullName,
      serviceNumber: (driver as any).serviceNumber ?? "—",
      driverStatus: "OnWork",
    }

    const selected = isSelected(driver.id, item.bus?.id)
    const isBusMissing = !item.bus?.id || !item.bus?.govNumber

    return (
      <tr
          key={`${driver.id}-${item.bus?.id || "no-bus"}-${shift}-${index}`}
          className={`cursor-pointer hover:bg-sky-50 ${selected ? "bg-green-100" : ""}`}
          onClick={() => onSelect(driverDisplay, bus, shift)} // ✅ только выбор строки
        >
        <td className="border px-2 py-1 text-center">{index + 1}</td>
        <td className="border px-2 py-1">{driver.fullName}</td>
        <td className="border px-2 py-1 text-center">{driver.convoyNumber ?? "—"}</td>
        <td className="border px-2 py-1 text-center">{shift}</td>
        <td className="border px-2 py-1 text-center">{item.routeNumber}</td>
        <td className="border px-2 py-1 text-center">{item.exitNumber}</td>
        <td className="border px-2 py-1 text-center">{item.bus?.garageNumber ?? "—"}</td>
        <td className="border px-2 py-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <span>{item.bus?.govNumber ?? "—"}</span>
            {/* Эта кнопка заменяет только автобус — НЕ трогает выбор */}
            {item.bus && (
              <button
              onClick={(e) => {
                e.stopPropagation() // ❗ чтобы не сработал клик по строке
                if (item.bus?.convoyId && item.dispatchBusLineId) {
                  setDialogData({
                    driverId: driverDisplay.id,
                    convoyId: item.bus.convoyId,
                    shift,
                    dispatchBusLineId: item.dispatchBusLineId,
                  })
                  setBusDialogOpen(true)
                }
              }}
              className="text-blue-600 underline hover:text-blue-800 text-xs"
              title="Заменить автобус"
            >
              🔁
            </button>            
            )}
          </div>
        </td>
        <td className="border px-2 py-1 text-center">
          {selected && <CheckCircle2 className="w-4 h-4 text-green-700 inline" />}
        </td>
      </tr>
    )
  }

  return (
    <>
      <div className="max-h-[400px] overflow-y-auto border rounded text-sm">
        <table className="w-full">
          <thead className="bg-sky-100 text-sky-800">
            <tr>
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
            {filtered.flatMap((item, index) =>
              [
                renderDriverRow(item.firstDriver, item, 1, index),
                renderDriverRow(item.secondDriver, item, 2, index),
              ].filter(Boolean)
            )}
          </tbody>
        </table>
      </div>

      {dialogData && (
        <BusSelectDialog
          open={busDialogOpen}
          onClose={() => setBusDialogOpen(false)}
          convoyId={dialogData.convoyId}
          date={format(new Date(), "yyyy-MM-dd")}
          driverId={dialogData.driverId}
          dispatchBusLineId={dialogData.dispatchBusLineId}
          isFirstShift={dialogData.shift === 1}
          onSuccess={() => {
            setBusDialogOpen(false)
            reloadAssignmentReplacements() // ✅ вот ключевая строчка
          }}
        />
      )}
    </>
  )
}
