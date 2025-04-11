// "use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Check, UserPlus } from "lucide-react"
import type { Bus } from "@/types/bus.types"
import type { Driver, DriverFilterRequest } from "@/types/driver.types"
import { getBusStatusLabel } from "@/app/dashboard/fleet-manager/buses/utils/busStatusUtils"
import { driverService } from "@/service/driverService"

interface AddBusDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (bus: Omit<Bus, "id">, driverIds: string[]) => void
}

export default function AddBusDialog({ open, onClose, onAdd }: AddBusDialogProps) {
  const [formData, setFormData] = useState<Omit<Bus, "id">>({
    garageNumber: "",
    govNumber: "",
    busStatus: "OnWork",
    additionalInfo: "",
    convoyId: "", // ✅ временно пусто, заполним ниже
    // busLineId: "",
  })
  

  const [activeTab, setActiveTab] = useState("info")
  const [driverSearchQuery, setDriverSearchQuery] = useState("")
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([])

  useEffect(() => {
    if (activeTab !== "drivers") return
    if (!formData.convoyId) return
  
    const filter: DriverFilterRequest = {
      convoyId: formData.convoyId,
      fullName: null,
      serviceNumber: null,
      address: null,
      phone: null,
      driverStatus: null,
      page: 1,
      pageSize: 1000,
    }
  
    driverService.filter(filter).then((res) => {
      if (res.isSuccess && Array.isArray(res.value)) {
        const drivers = res.value
        setAvailableDrivers(
          drivers.filter((driver) =>
            !selectedDrivers.some((d) => d.id === driver.id)
          )
        )
      } else {
        console.warn("🚫 Ошибка при загрузке водителей или пустой список")
      }
    })
  }, [activeTab, selectedDrivers, formData.convoyId])
  
  

  useEffect(() => {
    const authData = localStorage.getItem("authData")
    if (!authData) return
  
    const { convoyId } = JSON.parse(authData)
  
    if (!convoyId) return
  
    setFormData((prev) => ({
      ...prev,
      convoyId,
    }))
  }, [])

  const handleChange = (field: keyof Omit<Bus, "id">, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const filteredAvailableDrivers = availableDrivers.filter((driver) => {
    if (!driverSearchQuery) return true

    const searchLower = driverSearchQuery.toLowerCase()
    return (
      driver.serviceNumber.toLowerCase().includes(searchLower) ||
      driver.fullName.toLowerCase().includes(searchLower)
    )
  })

  const handleAssignDriver = (driver: Driver) => {
    setSelectedDrivers((prev) => [...prev, driver])
    setAvailableDrivers((prev) => prev.filter((d) => d.id !== driver.id))
  }

  const handleRemoveDriver = (driver: Driver) => {
    setSelectedDrivers((prev) => prev.filter((d) => d.id !== driver.id))
    setAvailableDrivers((prev) => [...prev, driver])
  }

  const handleSubmit = () => {
    if (!formData.garageNumber) return

    onAdd(
      formData,
      selectedDrivers.map((d) => d.id!).filter(Boolean)
    )    

    setFormData({
      garageNumber: "",
      govNumber: "",
      busStatus: "OnWork",
      additionalInfo: "",
      convoyId: formData.convoyId,
      // busLineId: "",
    })
    setSelectedDrivers([])
    setActiveTab("info")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Добавить новый автобус</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="drivers">Водители</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="garageNumber" className="text-right">
                Гаражный номер *
              </Label>
              <Input
                id="garageNumber"
                value={formData.garageNumber}
                onChange={(e) => handleChange("garageNumber", e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="govNumber" className="text-right">
                Гос. номер
              </Label>
              <Input
                id="govNumber"
                value={formData.govNumber}
                onChange={(e) => handleChange("govNumber", e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="busStatus" className="text-right">
                Статус
              </Label>
              <Select value={formData.busStatus} onValueChange={(value) => handleChange("busStatus", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OnWork">{getBusStatusLabel("OnWork")}</SelectItem>
                  <SelectItem value="UnderRepair">{getBusStatusLabel("UnderRepair")}</SelectItem>
                  <SelectItem value="LongTermRepair">{getBusStatusLabel("LongTermRepair")}</SelectItem>
                  <SelectItem value="DayOff">{getBusStatusLabel("DayOff")}</SelectItem>
                  <SelectItem value="Decommissioned">{getBusStatusLabel("Decommissioned")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="additionalInfo" className="text-right pt-2">
                Дополнительная информация
              </Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleChange("additionalInfo", e.target.value)}
                className="col-span-3 min-h-[100px]"
                placeholder="Введите дополнительную информацию об автобусе..."
              />
            </div>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Назначенные водители</h3>
                {selectedDrivers.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                    {selectedDrivers.map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-bold">№ {driver.serviceNumber}</p>
                          <p className="text-sm text-gray-600">{driver.fullName}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDriver(driver)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserPlus className="h-4 w-4 rotate-45" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Нет назначенных водителей</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Доступные водители</h3>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Поиск по табельному номеру или ФИО..."
                    className="pl-10"
                    value={driverSearchQuery}
                    onChange={(e) => setDriverSearchQuery(e.target.value)}
                  />
                </div>

                <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                  {filteredAvailableDrivers.length > 0 ? (
                    <div className="space-y-2">
                      {filteredAvailableDrivers.map((driver) => (
                        <div key={driver.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-bold">№ {driver.serviceNumber}</p>
                            <p className="text-sm text-gray-600">{driver.fullName}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAssignDriver(driver)}
                            className="text-green-500 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-2">
                      {driverSearchQuery ? "Водители не найдены" : "Нет доступных водителей"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>Добавить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
