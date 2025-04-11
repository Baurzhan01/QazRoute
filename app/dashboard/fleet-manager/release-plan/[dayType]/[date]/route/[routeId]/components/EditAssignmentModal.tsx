"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Check, AlertCircle } from "lucide-react"
import type { EditAssignmentModalProps, Bus, Driver, Departure } from "../types"

export default function EditAssignmentModal({
  isOpen,
  onClose,
  departure,
  availableBuses,
  availableDrivers,
  onSave,
}: EditAssignmentModalProps) {
  const [activeTab, setActiveTab] = useState("bus")
  const [selectedBus, setSelectedBus] = useState<Bus | null>(departure?.bus || null)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(departure?.driver || null)
  const [busSearchQuery, setBusSearchQuery] = useState("")
  const [driverSearchQuery, setDriverSearchQuery] = useState("")

  // Фильтрация автобусов по поисковому запросу
  const filteredBuses = availableBuses.filter((bus) => {
    if (!busSearchQuery) return true

    const searchLower = busSearchQuery.toLowerCase()
    return bus.garageNumber.toLowerCase().includes(searchLower) || bus.stateNumber.toLowerCase().includes(searchLower)
  })

  // Фильтрация водителей по поисковому запросу
  const filteredDrivers = availableDrivers.filter((driver) => {
    if (!driverSearchQuery) return true

    const searchLower = driverSearchQuery.toLowerCase()
    return driver.personnelNumber.includes(searchLower) || driver.fullName.toLowerCase().includes(searchLower)
  })

  const handleSave = () => {
    if (!departure) return

    const updatedDeparture: Departure = {
      ...departure,
      bus: selectedBus,
      driver: selectedDriver,
    }

    onSave(updatedDeparture)
    onClose()
  }

  if (!departure) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Редактирование назначения для выхода {departure.departureNumber}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bus">Автобус</TabsTrigger>
            <TabsTrigger value="driver">Водитель</TabsTrigger>
          </TabsList>

          <TabsContent value="bus" className="space-y-4 py-4">
            <div className="space-y-4">
              <Label>Выберите автобус</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Поиск по гаражному или гос. номеру..."
                    className="pl-8"
                    value={busSearchQuery}
                    onChange={(e) => setBusSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-md h-48 overflow-y-auto p-2">
                {filteredBuses.length > 0 ? (
                  <div className="space-y-2">
                    {filteredBuses.map((bus) => (
                      <div
                        key={bus.id}
                        className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                          selectedBus?.id === bus.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedBus(bus)}
                      >
                        <div>
                          <div className="font-medium">{bus.garageNumber}</div>
                          <div className="text-sm text-gray-600">{bus.stateNumber}</div>
                          <div className="text-xs mt-1">
                            <Badge
                              variant="outline"
                              className={
                                bus.status === "На линии"
                                  ? "bg-green-50 text-green-700"
                                  : bus.status === "На ремонте"
                                    ? "bg-amber-50 text-amber-700"
                                    : bus.status === "Выходной"
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-gray-50 text-gray-700"
                              }
                            >
                              {bus.status}
                            </Badge>
                          </div>
                        </div>
                        {selectedBus?.id === bus.id && <Check className="h-4 w-4 text-blue-500" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">Автобусы не найдены</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="driver" className="space-y-4 py-4">
            <div className="space-y-4">
              <Label>Выберите водителя</Label>
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
                          driver.isAssigned && driver.id !== departure.driver?.id
                            ? "bg-red-50 border border-red-200"
                            : selectedDriver?.id === driver.id
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          if (!driver.isAssigned || driver.id === departure.driver?.id) {
                            setSelectedDriver(driver)
                          }
                        }}
                      >
                        <div>
                          <div className="font-medium">
                            {driver.fullName}
                            {driver.isAssigned && driver.id !== departure.driver?.id && (
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
                          {driver.isAssigned && driver.id !== departure.driver?.id && (
                            <div className="text-xs text-red-500 mt-1 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Назначен на маршрут {driver.assignedRoute}, выход {driver.assignedDeparture}
                            </div>
                          )}
                        </div>
                        {selectedDriver?.id === driver.id && <Check className="h-4 w-4 text-blue-500" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">Водители не найдены</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

