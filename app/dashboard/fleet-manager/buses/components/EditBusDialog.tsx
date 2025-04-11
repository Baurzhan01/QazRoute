"use client"

import { useEffect, useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatShortName } from "../utils/formatShortName"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Check, UserMinus } from "lucide-react"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import type { Bus, BusStatus, BusWithDrivers } from "@/types/bus.types"
import type { Driver, DriverFilterRequest } from "@/types/driver.types"
import { getBusStatusLabel } from "../utils/busStatusUtils"

interface EditBusDialogProps {
  bus: BusWithDrivers
  open: boolean
  onClose: () => void
  refetch: () => void
}

export default function EditBusDialog({ bus, open, onClose, refetch }: EditBusDialogProps) {
  const [updatedBus, setUpdatedBus] = useState<Bus>({ ...bus })
  const [assigned, setAssigned] = useState(bus.drivers)
  const [available, setAvailable] = useState<Driver[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    setUpdatedBus({ ...bus })
    setAssigned(bus.drivers)
  }, [bus])

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const auth = localStorage.getItem("authData")
        const convoyId = auth ? JSON.parse(auth)?.convoyId : null
        if (!convoyId) return

        const filter: DriverFilterRequest = {
          convoyId,
          page: 1,
          pageSize: 1000,
          fullName: null,
          serviceNumber: null,
          address: null,
          phone: null,
          driverStatus: null
        }

        const res = await driverService.filter(filter)

        if (res.isSuccess && Array.isArray(res.value)) {
          const assignedIds = new Set((bus.drivers || []).map(d => d.id))
          const filtered = res.value.filter(d => d.id && !assignedIds.has(d.id))
          setAvailable(filtered)
        } else {
          console.error("❌ Ошибка или value не массив:", res)
        }
      } catch (e) {
        console.error("🚨 Ошибка загрузки водителей:", e)
      }
    }

    loadDrivers()
  }, [bus])

  const assign = async (driverId: string) => {
    await busService.assignDrivers(bus.id, [driverId])
    refetch()
  }

  const unassign = async (driverId: string) => {
    await busService.removeDriver(bus.id, driverId)
    refetch()
  }

  const save = async () => {
    await busService.update(bus.id, updatedBus)
    refetch()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Редактировать автобус</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="drivers">Водители</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="garageNumber">Гаражный номер</Label>
                <Input
                  id="garageNumber"
                  value={updatedBus.garageNumber}
                  onChange={(e) => setUpdatedBus({ ...updatedBus, garageNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="govNumber">Гос. номер</Label>
                <Input
                  id="govNumber"
                  value={updatedBus.govNumber}
                  onChange={(e) => setUpdatedBus({ ...updatedBus, govNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="busStatus">Статус</Label>
                <Select
                  value={updatedBus.busStatus}
                  onValueChange={(value) =>
                    setUpdatedBus({ ...updatedBus, busStatus: value as BusStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {["OnWork", "UnderRepair", "LongTermRepair", "DayOff", "Decommissioned"].map((status) => (
                      <SelectItem key={status} value={status}>
                        {getBusStatusLabel(status as BusStatus)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="additionalInfo">Дополнительная информация</Label>
                <Textarea
                  id="additionalInfo"
                  value={updatedBus.additionalInfo}
                  onChange={(e) =>
                    setUpdatedBus({ ...updatedBus, additionalInfo: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="drivers" className="space-y-4 py-4">
            {/* Поиск */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="driver-search"
                placeholder="Поиск по табельному номеру или фамилии..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Списки водителей */}
            <div className="grid grid-cols-2 gap-4">
              {/* Назначенные водители */}
              <div className="border rounded-lg p-3 bg-white shadow-sm">
                <h4 className="text-sm font-semibold mb-2">Назначенные водители</h4>
                {assigned.length > 0 ? (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto">
                    {assigned.map((driver) => (
                      <div key={driver.id} className="flex justify-between items-center p-2 border rounded bg-muted hover:bg-accent">
                        <div>
                          <p className="font-bold">№ {driver.serviceNumber}</p>
                          <p className="text-sm text-gray-600">{formatShortName(driver.fullName)}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => unassign(driver.id!)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500">Нет назначенных водителей</p>
                )}
              </div>

              {/* Доступные водители */}
              <div className="border rounded-lg p-3 bg-white shadow-sm">
                <h4 className="text-sm font-semibold mb-2">Доступные водители</h4>
                {available.length > 0 ? (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto">
                    {available
                      .filter((d) =>
                        d.serviceNumber?.toLowerCase().includes(search.toLowerCase()) ||
                        d.fullName?.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((driver) => (
                        <div key={driver.id} className="flex justify-between items-center p-2 border rounded bg-muted hover:bg-accent">
                          <div>
                            <p className="font-bold">№ {driver.serviceNumber}</p>
                            <p className="text-sm text-gray-600">{formatShortName(driver.fullName)}</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-green-500 hover:text-green-700 hover:bg-green-50"
                            onClick={() => assign(driver.id!)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500">
                    {search ? "Водители не найдены" : "Нет доступных водителей"}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={save}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
