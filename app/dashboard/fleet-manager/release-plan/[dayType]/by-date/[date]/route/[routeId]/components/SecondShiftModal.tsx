"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Check, AlertCircle } from "lucide-react"
import type { SecondShiftModalProps, Driver } from "../types"
import { getShiftChangeTime } from "../mockData"

export default function SecondShiftModal({
  isOpen,
  onClose,
  departure,
  availableDrivers,
  onSave,
  schedules,
}: SecondShiftModalProps) {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [driverSearchQuery, setDriverSearchQuery] = useState("")
  const [shiftChangeTime, setShiftChangeTime] = useState("")
  const [useScheduleTime, setUseScheduleTime] = useState(true)

  // Получаем время пересменки из графика при изменении выхода
  useEffect(() => {
    if (departure && useScheduleTime) {
      const scheduleTime = getShiftChangeTime("1", departure.departureNumber) // Используем "1" как ID маршрута для примера
      if (scheduleTime) {
        setShiftChangeTime(scheduleTime)
      }
    }
  }, [departure, useScheduleTime])

  // Фильтрация водителей по поисковому запросу
  const filteredDrivers = availableDrivers.filter((driver) => {
    if (!driverSearchQuery) return true

    const searchLower = driverSearchQuery.toLowerCase()
    return driver.personnelNumber.includes(searchLower) || driver.fullName.toLowerCase().includes(searchLower)
  })

  const handleSave = () => {
    if (selectedDriver && shiftChangeTime) {
      onSave(selectedDriver.id, shiftChangeTime)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавление второй смены для выхода {departure?.departureNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Выбор водителя */}
          <div className="space-y-4">
            <Label>Выберите водителя для второй смены</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Поиск по табельному номеру или ФИО..."
                  className="pl-8"
                  value={driverSearchQuery}
                  onChange={(e) => setDriverSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="border rounded-md h-48 overflow-y-auto p-2">
              {filteredDrivers.length > 0 ? (
                <div className="space-y-2">
                  {filteredDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                        driver.isAssigned
                          ? "bg-red-50 border border-red-200"
                          : selectedDriver?.id === driver.id
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                      }`}
                      onClick={() => !driver.isAssigned && setSelectedDriver(driver)}
                    >
                      <div>
                        <div className="font-medium">
                          {driver.fullName}
                          {driver.isAssigned && (
                            <Badge variant="outline" className="ml-2 text-red-500">
                              Занят
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">№ {driver.personnelNumber}</div>
                        <div className="text-xs mt-1">
                          <Badge
                            variant="outline"
                            className={
                              driver.status === "Активен"
                                ? "bg-green-50 text-green-700"
                                : driver.status === "В отпуске"
                                  ? "bg-blue-50 text-blue-700"
                                  : driver.status === "Болен"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-gray-50 text-gray-700"
                            }
                          >
                            {driver.status}
                          </Badge>
                        </div>
                        {driver.isAssigned && (
                          <div className="text-xs text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Назначен на маршрут {driver.assignedRoute}, выход {driver.assignedDeparture}
                          </div>
                        )}
                      </div>
                      {selectedDriver?.id === driver.id && !driver.isAssigned && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">Водители не найдены</div>
              )}
            </div>
          </div>

          {/* Время пересменки */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="shiftChangeTime">Время пересменки</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useScheduleTime"
                  checked={useScheduleTime}
                  onChange={(e) => setUseScheduleTime(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="useScheduleTime" className="text-sm font-normal">
                  Использовать время из графика
                </Label>
              </div>
            </div>
            <Input
              id="shiftChangeTime"
              value={shiftChangeTime}
              onChange={(e) => setShiftChangeTime(e.target.value)}
              placeholder="HH:MM"
              disabled={useScheduleTime}
            />
            {useScheduleTime && !shiftChangeTime && (
              <p className="text-sm text-amber-600">
                Для этого выхода не найден график с временем пересменки. Пожалуйста, введите время вручную.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!selectedDriver || !shiftChangeTime}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

