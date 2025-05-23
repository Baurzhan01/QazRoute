"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import SelectableList from "@/app/dashboard/fleet-manager/release-plan/components/SelectableList"
import SearchInput from "@/app/dashboard/fleet-manager/release-plan/components/SearchInput"

import { useState, useEffect } from "react"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import type { ReserveDepartureUI } from "@/types/reserve.types"

import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import { releasePlanService } from "@/service/releasePlanService"
import { useDebounce } from "../../../../../utils/useDebounce"

interface AssignmentDialogProps {
  open: boolean
  onClose: () => void
  selectedDeparture: ReserveDepartureUI | null
  selectedBus: DisplayBus | null
  selectedDriver: DisplayDriver | null
  busSearchQuery: string
  driverSearchQuery: string
  onBusSearchChange: (query: string) => void
  onDriverSearchChange: (query: string) => void
  onSelectBus: (bus: DisplayBus) => void
  onSelectDriver: (driver: DisplayDriver) => void
  convoyId: string
  date: string
  onSave: (bus: DisplayBus | null, driver: DisplayDriver | null) => void
}

export default function AssignmentDialog({
  open,
  onClose,
  selectedDeparture,
  selectedBus,
  selectedDriver,
  busSearchQuery,
  driverSearchQuery,
  onBusSearchChange,
  onDriverSearchChange,
  onSelectBus,
  onSelectDriver,
  convoyId,
  date,
  onSave,
}: AssignmentDialogProps) {
  const [buses, setBuses] = useState<DisplayBus[]>([])
  const [drivers, setDrivers] = useState<DisplayDriver[]>([])
  const [freeDrivers, setFreeDrivers] = useState<DisplayDriver[]>([])
  const [forceDriverMode, setForceDriverMode] = useState(false)

  const debouncedBusSearch = useDebounce(busSearchQuery, 300)
  const debouncedDriverSearch = useDebounce(driverSearchQuery, 300)

  const fetchBuses = async () => {
    const res = await busService.getFreeBuses(date, convoyId)
    const withFlags = (res ?? []).map((bus) => ({
      ...bus,
      isAssigned: bus.isBusy ?? false,
    }))
    setBuses(withFlags)
  }

  const fetchFreeDrivers = async () => {
    const res = await driverService.getFreeDrivers(date, convoyId)
    const drivers = (res.value ?? []).map((d) => ({
      ...d,
      isAssigned: d.isBusy ?? false,
    }))
    setFreeDrivers(drivers)
    setDrivers(drivers)
  }

  useEffect(() => {
    if (!open) return
    setForceDriverMode(false)
    fetchBuses()
    fetchFreeDrivers()
  }, [open, date, convoyId])

  useEffect(() => {
    if (!selectedBus && !forceDriverMode) return

    if (forceDriverMode) {
      setDrivers(freeDrivers)
    } else if (selectedBus) {
      busService.getWithDrivers(selectedBus.id).then((res) => {
        const busDrivers = res.value?.drivers ?? []
        const mapped = busDrivers
          .map((d) => freeDrivers.find((fd) => fd.id === d.id) ?? null)
          .filter(Boolean) as DisplayDriver[]
        setDrivers(mapped)
      })
    }
  }, [selectedBus, forceDriverMode, freeDrivers])

  const filteredBuses = buses.filter((bus) =>
    `${bus.garageNumber} ${bus.govNumber}`.toLowerCase().includes(debouncedBusSearch.toLowerCase())
  )

  const filteredDrivers = drivers.filter((driver) =>
    `${driver.fullName} ${driver.serviceNumber}`.toLowerCase().includes(debouncedDriverSearch.toLowerCase())
  )

  if (!selectedDeparture) return null

  const handleSave = async () => {
    if (!selectedDeparture || !selectedBus) return

    try {
      await releasePlanService.assignToReserve(date, [
        {
          busId: selectedBus.id,
          driverId: selectedDriver?.id ?? undefined
        },
      ])

      toast({ title: "Назначение сохранено" })
      onSave(selectedBus, selectedDriver)
      onClose()
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить назначение", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-wide text-gray-800">
            Назначение автобуса и водителя
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-10 text-lg text-gray-700">
          <div>
            <Label className="block mb-2 text-lg font-semibold">Автобус</Label>
            <SearchInput value={busSearchQuery} onChange={onBusSearchChange} placeholder="🔍 Поиск автобуса..." />
            <SelectableList
              items={filteredBuses}
              selected={selectedBus}
              onSelect={(bus) => {
                onSelectBus(bus)
                setForceDriverMode(false)
                setDrivers([])
                onDriverSearchChange("")
              }}
              labelKey="garageNumber"
              subLabelKey={(bus) => bus.govNumber}
              status={(bus) =>
                bus.isAssigned
                  ? { label: "НАЗНАЧЕН", color: "red" }
                  : { label: "НЕ назначен", color: "green" }
              }
              disableItem={(bus) => !!bus.isAssigned}
            />
          </div>

          {selectedBus && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-lg font-semibold">Водитель</Label>
                {!forceDriverMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForceDriverMode(true)
                      setDrivers([])
                      onDriverSearchChange("")
                    }}
                  >
                    Принудительно назначить
                  </Button>
                )}
              </div>
              <SearchInput value={driverSearchQuery} onChange={onDriverSearchChange} placeholder="🔍 Поиск водителя..." />
              <SelectableList
                items={filteredDrivers}
                selected={selectedDriver}
                onSelect={onSelectDriver}
                labelKey="fullName"
                subLabelKey={(d) => `№ ${d.serviceNumber}`}
                status={(d) =>
                  d.isAssigned
                    ? { label: "НАЗНАЧЕН", color: "red" }
                    : { label: "НЕ назначен", color: "green" }
                }
                disableItem={(d) => !!d.isAssigned}
              />
            </div>
          )}
        </div>

        <DialogFooter className="pt-6">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
