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
import SearchInput from "@/app/dashboard/fleet-manager/release-plan/components/SearchInput"
import SelectableList from "../components/SelectableList"

import { useState, useEffect } from "react"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import type { LocalDeparture } from "@/types/releasePlanTypes"
import {
  getStatus,
  isAvailableBusStatus,
  BUS_STATUS_MAP,
  DRIVER_STATUS_MAP,
} from "../../../../../../utils/statusUtils"
import { busService } from "@/service/busService"
import { releasePlanService } from "@/service/releasePlanService"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"

interface AssignmentDialogProps {
  open: boolean
  onClose: () => void
  selectedDeparture: LocalDeparture | null
  assignedBusesMap: Record<string, { routeNumber: string; departureNumber: number }>
  assignedDriversMap: Record<string, { routeNumber: string; departureNumber: number }>
  globalAssignedDriversMap: Record<string, { routeNumber: string; departureNumber: number }>
  routeId: string
  date: string
  convoyId: string
  onSaved: (bus: DisplayBus | null, driver: DisplayDriver | null) => void
}

export default function AssignmentDialog({
  open,
  onClose,
  selectedDeparture,
  assignedBusesMap,
  assignedDriversMap,
  globalAssignedDriversMap,
  routeId,
  date,
  convoyId,
  onSaved,
}: AssignmentDialogProps) {
  const queryClient = useQueryClient()
  const [busSearchQuery, setBusSearchQuery] = useState("")
  const [driverSearchQuery, setDriverSearchQuery] = useState("")
  const [availableBuses, setAvailableBuses] = useState<DisplayBus[]>([])
  const [busDrivers, setBusDrivers] = useState<DisplayDriver[]>([])
  const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null)
  const [forceDriverMode, setForceDriverMode] = useState(false)

  useEffect(() => {
    if (!open || !selectedDeparture) return

    setSelectedBus(null)
    setSelectedDriver(null)
    setBusSearchQuery("")
    setDriverSearchQuery("")
    setBusDrivers([])
    setForceDriverMode(false)

    busService
      .getFreeBuses(date, convoyId)
      .then((res) => setAvailableBuses(res ?? []))
      .catch(() => toast({ title: "Не удалось загрузить автобусы", variant: "destructive" }))
  }, [open, selectedDeparture, convoyId, date])

  useEffect(() => {
    if (!selectedBus && !forceDriverMode) return

    releasePlanService
      .getFreeDrivers(date, convoyId, forceDriverMode ? null : selectedBus?.id ?? null)
      .then((res) => {
        const drivers = res?.value ?? []
        const mapped = drivers.map((d: any) => ({
          id: d.id,
          fullName: d.fullName,
          serviceNumber: d.serviceNumber,
          driverStatus: d.driverStatus || "DayOff",
        }))
        setBusDrivers(mapped)
      })
      .catch(() =>
        toast({ title: "Не удалось загрузить водителей", variant: "destructive" })
      )
  }, [selectedBus, convoyId, date, forceDriverMode])

  const filteredBuses = availableBuses.filter((bus) =>
    bus.garageNumber.toLowerCase().includes(busSearchQuery.toLowerCase())
  )

  const filteredDrivers = busDrivers.filter((driver) =>
    driver.fullName.toLowerCase().includes(driverSearchQuery.toLowerCase())
  )

  const handleSave = async () => {
    if (!selectedDeparture || !selectedBus) return

    try {
      await releasePlanService.assignToBusLine(date, {
        dispatchBusLineId: selectedDeparture.id,
        busId: selectedBus.id,
        driver1Id: selectedDriver?.id ?? null,
        driver2Id: null,
      })

      await queryClient.invalidateQueries({ queryKey: ["routeAssignments", routeId, date] })
      onSaved(selectedBus, selectedDriver ?? null)
      toast({ title: "Назначение сохранено" })
      onClose()
    } catch {
      toast({ title: "Ошибка при назначении", variant: "destructive" })
    }
  }

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
            <SearchInput
              value={busSearchQuery}
              onChange={setBusSearchQuery}
              placeholder="Поиск автобуса..."
            />
            <SelectableList
              items={filteredBuses}
              selected={selectedBus}
              onSelect={(bus) => {
                setSelectedBus(bus)
                setSelectedDriver(null)
                setForceDriverMode(false) // сбрасываем force режим
                setBusDrivers([])          // сбрасываем водителей
                setDriverSearchQuery("")   // сбрасываем поиск
              }}
              labelKey="garageNumber"
              subLabelKey={(bus) => bus.govNumber}
              status={(bus) =>
                assignedBusesMap[bus.id]
                  ? { label: "Уже назначен", color: "yellow" }
                  : isAvailableBusStatus(bus.status)
                  ? getStatus(BUS_STATUS_MAP, "available")
                  : getStatus(BUS_STATUS_MAP, bus.status)
              }
              disableItem={(bus) =>
                !!assignedBusesMap[bus.id] ||
                ["UnderRepair", "LongTermRepair", "Decommissioned"].includes(bus.status)
              }
            />
          </div>

          {selectedBus && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label>Водитель</Label>
                {!forceDriverMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForceDriverMode(true)
                      setSelectedDriver(null)
                      setBusDrivers([])
                    }}
                  >
                    Принудительно назначить
                  </Button>
                )}
              </div>

              <SearchInput
                value={driverSearchQuery}
                onChange={setDriverSearchQuery}
                placeholder="Поиск водителя..."
              />
              <SelectableList
                items={filteredDrivers}
                selected={selectedDriver}
                onSelect={setSelectedDriver}
                labelKey="fullName"
                subLabelKey={(driver) => `№ ${driver.serviceNumber}`}
                status={(driver) => {
                  if (assignedDriversMap[driver.id]) {
                    return { label: "Уже назначен", color: "yellow" }
                  }
                  const global = globalAssignedDriversMap[driver.id]
                  if (global) {
                    return {
                      label: `Назначен на маршрут №${global.routeNumber} (${global.departureNumber} вых.)`,
                      color: "red",
                    }
                  }
                  return getStatus(DRIVER_STATUS_MAP, driver.driverStatus)
                }}
                disableItem={(driver) =>
                  !!assignedDriversMap[driver.id] ||
                  !!globalAssignedDriversMap[driver.id] ||
                  ["OnVacation", "OnSickLeave", "Fired", "Intern"].includes(driver.driverStatus)
                }
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!selectedBus}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
