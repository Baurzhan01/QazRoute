"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import type { ReserveDepartureUI } from "@/types/reserve.types"
import { v4 as uuidv4 } from "uuid"

interface ReserveTableProps {
  departures: ReserveDepartureUI[]
  onAddAssignment: (departure: ReserveDepartureUI) => void
  onRemoveAssignment: (departureId: string) => void
  onUpdateDepartures: (departures: ReserveDepartureUI[]) => void
  onUpdateAssignment: (updated: ReserveDepartureUI) => void
}

export default function ReserveTable({
  departures,
  onAddAssignment,
  onRemoveAssignment,
  onUpdateDepartures,
  onUpdateAssignment,
}: ReserveTableProps) {
  const [filterAssigned, setFilterAssigned] = useState<"all" | "assigned" | "unassigned">("all")

  const filteredDepartures = useMemo(() => {
    if (filterAssigned === "assigned") {
      return departures.filter((d) => d.bus && d.driver)
    }
    if (filterAssigned === "unassigned") {
      return departures.filter((d) => !d.bus || !d.driver)
    }
    return departures
  }, [departures, filterAssigned])
  

  const handleAddRow = () => {
    const newDeparture: ReserveDepartureUI = {
      id: uuidv4(),
      sequenceNumber: departures.length + 1,
      departureTime: "",
      scheduleTime: "",
      endTime: "",
    }
    onUpdateDepartures([...departures, newDeparture])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">№</th>
              <th className="border p-2">Гар. номер</th>
              <th className="border p-2">Гос. номер</th>
              <th className="border p-2">ФИО</th>
              <th className="border p-2">Таб. номер</th>
              <th className="border p-2">Время выхода</th>
              <th className="border p-2">По графику</th>
              <th className="border p-2">Доп. информация</th>
              <th className="border p-2">Пересм.</th>
              <th className="border p-2">ФИО (2 смена)</th>
              <th className="border p-2">Таб. номер (2 смена)</th>
              <th className="border p-2">Доп. информация (2 смена)</th>
              <th className="border p-2">Конец работы</th>
              <th className="border p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartures.map((departure) => (
              <tr key={departure.id}>
                <td className="border p-2">{departure.sequenceNumber}</td>

                <td className="border p-2">
                  {departure.bus ? (
                    <div>
                      <div>{departure.bus.garageNumber}</div>
                      <div className="text-xs mt-1">
                        <Badge
                          variant="outline"
                          className={
                            departure.bus.isAssigned
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                          }
                        >
                          {departure.bus.isAssigned ? "НАЗНАЧЕН" : "НЕ назначен"}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-500"
                      onClick={() => onAddAssignment(departure)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Добавить
                    </Button>
                  )}
                </td>

                <td className="border p-2">{departure.bus?.govNumber || ""}</td>
                <td className="border p-2">{departure.driver?.fullName || ""}</td>
                <td className="border p-2">{departure.driver?.serviceNumber || ""}</td>
                <td className="border p-2">{departure.departureTime || ""}</td>
                <td className="border p-2">{departure.scheduleTime || ""}</td>
                <td className="border p-2">{departure.additionalInfo || ""}</td>
                <td className="border p-2"></td>
                <td className="border p-2">{departure.shift2Driver?.fullName || ""}</td>
                <td className="border p-2">{departure.shift2Driver?.serviceNumber || ""}</td>
                <td className="border p-2">{departure.shift2AdditionalInfo || ""}</td>
                <td className="border p-2">{departure.endTime || ""}</td>

                <td className="border p-2">
                  {departure.bus && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => onRemoveAssignment(departure.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleAddRow}>
          + Добавить строку
        </Button>
      </div>
    </div>
  )
}
