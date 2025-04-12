"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Edit, Clock, UserPlus } from "lucide-react"
import type { Departure } from "../types"

interface DepartureTableProps {
  departures: Departure[]
  onAddBus: (departure: Departure) => void
  onRemoveAssignment: (departureId: string) => void
  onEditAssignment: (departure: Departure) => void
  onAddSecondShift: (departure: Departure) => void
  onEditTime: (departure: Departure, timeType: "departureTime" | "scheduleTime" | "endTime") => void
}

export default function DepartureTable({
  departures,
  onAddBus,
  onRemoveAssignment,
  onEditAssignment,
  onAddSecondShift,
  onEditTime,
}: DepartureTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2} className="border-r">
              № Выходов
            </TableHead>
            <TableHead rowSpan={2} className="border-r">
              Гар. номер
            </TableHead>
            <TableHead rowSpan={2} className="border-r">
              Государ. номер
            </TableHead>
            <TableHead colSpan={5} className="text-center border-r">
              План на 1-ю смену
            </TableHead>
            <TableHead colSpan={3} className="text-center border-r">
              План на 2-ю смену
            </TableHead>
            <TableHead rowSpan={2}>Конец работы</TableHead>
            <TableHead rowSpan={2}>Действия</TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="border-r">ФИО</TableHead>
            <TableHead className="border-r">Таб. номер</TableHead>
            <TableHead className="border-r">Время выхода</TableHead>
            <TableHead className="border-r">По графику</TableHead>
            <TableHead className="border-r">Дополнительная информация</TableHead>
            <TableHead className="border-r">ФИО</TableHead>
            <TableHead className="border-r">Таб. номер</TableHead>
            <TableHead className="border-r">Дополнительная информация</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departures.map((departure) => (
            <TableRow key={departure.id}>
              <TableCell className="border-r font-bold">{departure.departureNumber}</TableCell>
              <TableCell className="border-r">
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
                  <Button variant="ghost" size="sm" className="text-blue-500" onClick={() => onAddBus(departure)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить
                  </Button>
                )}
              </TableCell>
              <TableCell className="border-r">{departure.bus?.stateNumber || ""}</TableCell>
              <TableCell className="border-r">
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
              </TableCell>
              <TableCell className="border-r">{departure.driver?.personnelNumber || ""}</TableCell>
              <TableCell className="border-r">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-blue-500"
                  onClick={() => onEditTime(departure, "departureTime")}
                >
                  {departure.departureTime}
                  <Clock className="ml-1 h-3 w-3" />
                </Button>
              </TableCell>
              <TableCell className="border-r">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-blue-500"
                  onClick={() => onEditTime(departure, "scheduleTime")}
                >
                  {departure.scheduleTime}
                  <Clock className="ml-1 h-3 w-3" />
                </Button>
              </TableCell>
              <TableCell className="border-r">{departure.additionalInfo}</TableCell>
              <TableCell className="border-r">
                {departure.shift2Driver ? (
                  <div>
                    {departure.shift2Driver.fullName}
                    <div className="text-xs mt-1">
                      <Badge
                        variant="outline"
                        className={
                          departure.shift2Driver.status === "Активен"
                            ? "bg-green-50 text-green-700"
                            : departure.shift2Driver.status === "В отпуске"
                              ? "bg-blue-50 text-blue-700"
                              : departure.shift2Driver.status === "Болен"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-50 text-gray-700"
                        }
                      >
                        {departure.shift2Driver.status}
                      </Badge>
                    </div>
                    {departure.shift2Time && (
                      <div className="text-xs mt-1 text-blue-600">Пересменка: {departure.shift2Time}</div>
                    )}
                  </div>
                ) : departure.bus ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-500"
                    onClick={() => onAddSecondShift(departure)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Добавить
                  </Button>
                ) : (
                  ""
                )}
              </TableCell>
              <TableCell className="border-r">{departure.shift2Driver?.personnelNumber || ""}</TableCell>
              <TableCell className="border-r">{departure.shift2AdditionalInfo}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-blue-500"
                  onClick={() => onEditTime(departure, "endTime")}
                >
                  {departure.endTime}
                  <Clock className="ml-1 h-3 w-3" />
                </Button>
              </TableCell>
              <TableCell>
                {departure.bus && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-500"
                      onClick={() => onEditAssignment(departure)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => onRemoveAssignment(departure.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

