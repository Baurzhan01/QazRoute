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

  const [loadingBuses, setLoadingBuses] = useState(false)
  const [loadingDrivers, setLoadingDrivers] = useState(false)

  const debouncedBusSearch = useDebounce(busSearchQuery, 300)
  const debouncedDriverSearch = useDebounce(driverSearchQuery, 300)

  useEffect(() => {
    if (!open) return

    setLoadingBuses(true)
    busService.getFreeBuses(date, convoyId).then((res) => {
      setBuses(res ?? [])
      setLoadingBuses(false)
    })

    setLoadingDrivers(true)
    driverService.getFreeDrivers(date, convoyId).then((res) => {
      const drivers = res.value ?? []
      setFreeDrivers(drivers)
      setDrivers(drivers)
      setLoadingDrivers(false)
    })

    setForceDriverMode(false)
  }, [open, date, convoyId])

  // Загружаем водителей при выборе автобуса или при активации режима "принудительно"
  useEffect(() => {
    if (!selectedBus && !forceDriverMode) return

    const fetch = async () => {
      setLoadingDrivers(true)

      if (forceDriverMode) {
        setDrivers(freeDrivers)
      } else if (selectedBus) {
        const res = await busService.getWithDrivers(selectedBus.id)
        const mapped: DisplayDriver[] =
          res.value?.drivers?.map((d: any) => ({
            id: d.id,
            fullName: d.fullName,
            serviceNumber: d.serviceNumber,
            convoyId,
            driverStatus: "OnWork",
          })) ?? []

        setDrivers(mapped)
      }

      setLoadingDrivers(false)
    }

    fetch()
  }, [selectedBus, forceDriverMode])

  const filteredBuses = buses.filter((bus) => {
    if (!debouncedBusSearch) return true
    return (
      bus.garageNumber.toLowerCase().includes(debouncedBusSearch.toLowerCase()) ||
      (bus.stateNumber?.toLowerCase().includes(debouncedBusSearch.toLowerCase()) ?? false)
    )
  })

  const filteredDrivers = drivers.filter((driver) => {
    if (!debouncedDriverSearch) return true
    return (
      driver.fullName.toLowerCase().includes(debouncedDriverSearch.toLowerCase()) ||
      driver.serviceNumber.includes(debouncedDriverSearch)
    )
  })

  if (!selectedDeparture) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Назначение автобуса и водителя</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Автобус</Label>
            <SearchInput value={busSearchQuery} onChange={onBusSearchChange} placeholder="Поиск автобуса..." />
            {loadingBuses ? (
              <div className="p-4 text-gray-500">Загрузка автобусов...</div>
            ) : (
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
                  bus.status === "OnWork"
                    ? { label: "На линии", color: "green" }
                    : { label: "Выходной", color: "gray" }
                }
                disableItem={() => false}
              />
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label>Водитель</Label>
              {!forceDriverMode && selectedBus && (
                <Button variant="outline" size="sm" onClick={() => setForceDriverMode(true)}>
                  Принудительно назначить
                </Button>
              )}
            </div>
            <SearchInput value={driverSearchQuery} onChange={onDriverSearchChange} placeholder="Поиск водителя..." />
            {loadingDrivers ? (
              <div className="p-4 text-gray-500">Загрузка водителей...</div>
            ) : (
              <SelectableList
                items={filteredDrivers}
                selected={selectedDriver}
                onSelect={onSelectDriver}
                labelKey="fullName"
                subLabelKey={(driver) => `№ ${driver.serviceNumber}`}
                status={(driver) =>
                  driver.driverStatus === "OnWork"
                    ? { label: "На работе", color: "green" }
                    : { label: "Выходной", color: "gray" }
                }
                disableItem={() => false}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            onClick={() => {
              if (!selectedBus) {
                toast({ title: "Ошибка", description: "Выберите автобус", variant: "destructive" })
                return
              }
              onSave(selectedBus, selectedDriver)
              onClose()
            }}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
