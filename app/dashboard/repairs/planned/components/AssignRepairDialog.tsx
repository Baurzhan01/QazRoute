"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import SearchInput from "@/app/dashboard/fleet-manager/release-plan/components/SearchInput"
import SelectableList from "@/app/dashboard/fleet-manager/release-plan/components/SelectableList"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import { repairService } from "@/service/repairService"
import { toast } from "@/components/ui/use-toast"
import { getAuthData } from "@/lib/auth-utils"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"

interface AssignRepairDialogProps {
  open: boolean
  onClose: () => void
  date: Date
  onSaved: () => void
}

export default function AssignRepairDialog({ open, onClose, date, onSaved }: AssignRepairDialogProps) {
    const convoyId = getAuthData()?.convoyId ?? ""
    const [availableBuses, setAvailableBuses] = useState<DisplayBus[]>([])
    const [busDrivers, setBusDrivers] = useState<DisplayDriver[]>([])
    const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(null)
    const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null)
    const [description, setDescription] = useState("")
    const [forceDriverMode, setForceDriverMode] = useState(false)
    const [busSearchQuery, setBusSearchQuery] = useState("")
    const [driverSearchQuery, setDriverSearchQuery] = useState("")
  
    useEffect(() => {
      if (!open) return
  
      busService.getFreeBuses(date.toISOString().split("T")[0], convoyId).then(setAvailableBuses).catch(() => {
        toast({ title: "Ошибка при загрузке автобусов", variant: "destructive" })
      })
    }, [open, date, convoyId])
  
    useEffect(() => {
      if (!selectedBus && !forceDriverMode) return
  
      const fetch = forceDriverMode
        ? driverService.getFreeDrivers(date.toISOString().split("T")[0], convoyId)
        : driverService.getByBusId(selectedBus!.id)
  
      fetch.then((res) => {
        const drivers = res.value ?? []
        const mapped: DisplayDriver[] = drivers.map((d: any) => ({
          id: d.id ?? "",
          fullName: d.fullName,
          serviceNumber: d.serviceNumber,
          driverStatus: d.driverStatus,
          isAssigned: d.isBusy ?? false,
        }))
        setBusDrivers(mapped)
      }).catch(() => {
        toast({ title: "Ошибка при загрузке водителей", variant: "destructive" })
      })
    }, [selectedBus, convoyId, date, forceDriverMode])
  
    const filteredBuses = availableBuses.filter((bus) =>
      `${bus.garageNumber} ${bus.govNumber}`.toLowerCase().includes(busSearchQuery.toLowerCase())
    )
  
    const filteredDrivers = busDrivers.filter((driver) =>
      driver.fullName.toLowerCase().includes(driverSearchQuery.toLowerCase())
    )
  
    const handleSave = async () => {
      if (!selectedBus || !selectedDriver) return
  
      const dto = [{
        busId: selectedBus.id,
        driverId: selectedDriver.id,
        description,
      }]
  
      try {
        await repairService.assignRepairs(date.toISOString().split("T")[0], convoyId, dto)
        toast({ title: "Ремонт успешно назначен" })
        onSaved()
      } catch {
        toast({ title: "Ошибка при назначении ремонта", variant: "destructive" })
      }
    }
  
    return (
        <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl rounded-2xl px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Назначить автобус и водителя на ремонт</DialogTitle>
          </DialogHeader>
      
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
      
            {/* 🚍 Блок автобуса */}
            <div className="space-y-3 border rounded-lg p-4 shadow-sm">
              <Label className="text-base font-semibold">Автобус</Label>
              <SearchInput
                value={busSearchQuery}
                onChange={setBusSearchQuery}
                placeholder="🔍 Поиск автобуса по гаражному или гос. номеру..."
              />
              <div className="max-h-[250px] overflow-y-auto">
                <SelectableList
                  items={filteredBuses}
                  selected={selectedBus}
                  onSelect={(bus) => {
                    setSelectedBus(bus)
                    setForceDriverMode(false)
                    setSelectedDriver(null)
                  }}
                  labelKey="garageNumber"
                  subLabelKey={(b) => b.govNumber}
                  status={() => ({ label: "Свободен", color: "green" })}
                />
              </div>
            </div>
      
            {/* 👨‍✈️ Блок водителя */}
            {selectedBus && (
              <div className="space-y-3 border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Водитель</Label>
                  {!forceDriverMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setForceDriverMode(true)}
                    >
                      Принудительно назначить
                    </Button>
                  )}
                </div>
                <SearchInput
                  value={driverSearchQuery}
                  onChange={setDriverSearchQuery}
                  placeholder="🔍 Поиск по ФИО водителя..."
                />
                <div className="max-h-[250px] overflow-y-auto">
                  <SelectableList
                    items={filteredDrivers}
                    selected={selectedDriver}
                    onSelect={setSelectedDriver}
                    labelKey="fullName"
                    subLabelKey={(d) => `№ ${d.serviceNumber}`}
                    status={() => ({ label: "Свободен", color: "green" })}
                  />
                </div>
              </div>
            )}
          </div>
      
          {/* 📝 Блок описания */}
          <div className="mt-6 space-y-2">
            <Label className="text-base font-semibold">Описание причины ремонта</Label>
            <Textarea
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Например: 'Проблемы с тормозной системой'"
            />
          </div>
      
          {/* 🔘 Кнопки */}
          <DialogFooter className="pt-6">
            <Button variant="outline" onClick={onClose}>Отмена</Button>
            <Button onClick={handleSave} disabled={!selectedBus || !selectedDriver}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>      
    )
  }
  