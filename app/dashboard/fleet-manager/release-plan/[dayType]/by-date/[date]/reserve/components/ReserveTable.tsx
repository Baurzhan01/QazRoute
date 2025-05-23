"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Bus, User } from "lucide-react"
import type { ReserveDepartureUI } from "@/types/reserve.types"
import { v4 as uuidv4 } from "uuid"

interface ReserveDepartureExtended extends ReserveDepartureUI {
  justAdded?: boolean
}

interface ReserveTableProps {
  departures: ReserveDepartureExtended[]
  onAddAssignment: (departure: ReserveDepartureUI) => void
  onRemoveAssignment: (departureId: string) => void
  onUpdateDepartures: (departures: ReserveDepartureExtended[]) => void
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
    const newDeparture: ReserveDepartureExtended = {
      id: uuidv4(),
      sequenceNumber: departures.length + 1,
      departureTime: "",
      scheduleTime: "",
      endTime: "",
      bus: null,
      driver: null,
      shift2Driver: null,
      justAdded: true,
    }
    const updatedDepartures = [...departures, newDeparture]
    onUpdateDepartures(updatedDepartures)
    setTimeout(() => {
      const cleared = updatedDepartures.map((d) =>
        d.id === newDeparture.id ? { ...d, justAdded: false } : d
      )
      onUpdateDepartures(cleared)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 mb-2 text-sm">
        <Button variant={filterAssigned === "all" ? "default" : "ghost"} onClick={() => setFilterAssigned("all")}>Все</Button>
        <Button variant={filterAssigned === "assigned" ? "default" : "ghost"} onClick={() => setFilterAssigned("assigned")}>Назначенные</Button>
        <Button variant={filterAssigned === "unassigned" ? "default" : "ghost"} onClick={() => setFilterAssigned("unassigned")}>Пустые</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr>
              <th className="border p-2">№</th>
              <th className="border p-2"><Bus className="w-4 h-4 inline text-gray-500 mr-1" />Гар. номер</th>
              <th className="border p-2">Гос. номер</th>
              <th className="border p-2"><User className="w-4 h-4 inline text-gray-500 mr-1" />ФИО</th>
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
            {filteredDepartures.map((departure) => {
              const status = departure.bus && departure.driver
                ? "assigned"
                : departure.bus || departure.driver
                ? "partial"
                : "unassigned"

              const badge = {
                assigned: <Badge className="bg-green-100 text-green-800">Назначено</Badge>,
                partial: <Badge className="bg-yellow-100 text-yellow-800">Частично</Badge>,
                unassigned: <Badge className="bg-gray-100 text-gray-600">Пусто</Badge>,
              }[status]

              return (
                <tr key={departure.id} className={departure.justAdded ? "animate-fade-in bg-yellow-50" : ""}>
                  <td className="border p-2 font-semibold text-center">{departure.sequenceNumber}</td>
                  <td className="border p-2">{departure.bus?.garageNumber || badge}</td>
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
                  <td className="border p-2 text-center">
                    {!departure.bus ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 font-medium"
                        onClick={() => onAddAssignment(departure)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Назначить
                      </Button>
                    ) : (
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
              )
            })}
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