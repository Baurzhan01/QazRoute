"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import type { ReserveDeparture } from "../types"

interface ReserveTableProps {
  departures: ReserveDeparture[]
  onAddAssignment: (departure: ReserveDeparture) => void
  onRemoveAssignment: (departureId: string) => void
}

export default function ReserveTable({ departures, onAddAssignment, onRemoveAssignment }: ReserveTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th rowSpan={2} className="border p-2 text-left">
              № маршрута
            </th>
            <th rowSpan={2} className="border p-2 text-left">
              Гар. номер
            </th>
            <th rowSpan={2} className="border p-2 text-left">
              Государ. номер
            </th>
            <th colSpan={5} className="border p-2 text-center">
              План на 1-ю смену
            </th>
            <th colSpan={3} className="border p-2 text-center">
              План на 2-ю смену
            </th>
            <th rowSpan={2} className="border p-2 text-left">
              Конец работы
            </th>
            <th rowSpan={2} className="border p-2 text-left">
              Действия
            </th>
          </tr>
          <tr>
            <th className="border p-2 text-left">ФИО</th>
            <th className="border p-2 text-left">Таб. номер</th>
            <th className="border p-2 text-left">Время выхода</th>
            <th className="border p-2 text-left">По графику</th>
            <th className="border p-2 text-left">Дополнительная информация</th>
            <th className="border p-2 text-left">Пересм.</th>
            <th className="border p-2 text-left">ФИО</th>
            <th className="border p-2 text-left">Таб. номер</th>
            <th className="border p-2 text-left">Дополнительная информация</th>
          </tr>
        </thead>
        <tbody>
          {departures.map((departure) => (
            <tr key={departure.id}>
              <td className="border p-2 font-bold">{departure.sequenceNumber}</td>
              <td className="border p-2">
                {departure.bus ? (
                  <div>
                    {departure.bus.garageNumber}
                    <div className="text-xs mt-1">
                      <Badge
                        variant="outline"
                        className={
                          departure.bus.status === "На линии"
                            ? "bg-green-50 text-green-700"
                            : departure.bus.status === "На ремонте"
                              ? "bg-amber-50 text-amber-700"
                              : departure.bus.status === "Выходной"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-50 text-gray-700"
                        }
                      >
                        {departure.bus.status}
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
              <td className="border p-2">{departure.bus?.stateNumber || ""}</td>
              <td className="border p-2">
                {departure.driver ? (
                  <div>
                    {departure.driver.fullName}
                    <div className="text-xs mt-1">
                      <Badge
                        variant="outline"
                        className={
                          departure.driver.status === "Активен"
                            ? "bg-green-50 text-green-700"
                            : departure.driver.status === "В отпуске"
                              ? "bg-blue-50 text-blue-700"
                              : departure.driver.status === "Болен"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-50 text-gray-700"
                        }
                      >
                        {departure.driver.status}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </td>
              <td className="border p-2">{departure.driver?.personnelNumber || ""}</td>
              <td className="border p-2">{departure.departureTime}</td>
              <td className="border p-2">{departure.scheduleTime}</td>
              <td className="border p-2">{departure.additionalInfo}</td>
              <td className="border p-2"></td>
              <td className="border p-2">{departure.shift2Driver?.fullName || ""}</td>
              <td className="border p-2">{departure.shift2Driver?.personnelNumber || ""}</td>
              <td className="border p-2">{departure.shift2AdditionalInfo}</td>
              <td className="border p-2">{departure.endTime}</td>
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
  )
}

