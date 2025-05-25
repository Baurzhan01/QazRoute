// AssignmentDialog.tsx
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
      .then((res) => {
        const buses = (res ?? []).map((bus) => ({
          ...bus,
          isAssigned: bus.isBusy ?? false,
        }))
        setAvailableBuses(buses)
      })
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
          isAssigned: d.isBusy ?? false,
        }))
        setBusDrivers(mapped)
      })
      .catch(() => toast({ title: "Не удалось загрузить водителей", variant: "destructive" }))
  }, [selectedBus, convoyId, date, forceDriverMode])

  const normalizedQuery = busSearchQuery.trim().toLowerCase();
  const filteredBuses = availableBuses.filter((bus) =>
    `${bus.garageNumber} ${bus.govNumber}`.toLowerCase().includes(normalizedQuery)
  );


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
            <DialogContent className="!w-[55vw] !max-w-[1400px] !max-h-[95vh] min-h-[500px] px-6 py-8 overflow-y-auto rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-wide text-gray-800">
                Назначение автобуса и водителя
              </DialogTitle>
            </DialogHeader>

          <div className="space-y-10 text-lg text-gray-700">
            <div>
              <Label className="block mb-2 text-lg font-semibold">Автобус</Label>
              <SearchInput
                value={busSearchQuery}
                onChange={setBusSearchQuery}
                placeholder="🔍 Поиск автобуса..."
              />
              <SelectableList
                items={filteredBuses}
                selected={selectedBus}
                onSelect={(bus) => {
                  setSelectedBus(bus)
                  setSelectedDriver(null)
                  setForceDriverMode(false)
                  setBusDrivers([])
                  setDriverSearchQuery("")
                }}
                labelKey="garageNumber"
                subLabelKey={(bus) => bus.govNumber}
                status={(bus) =>
                  bus.isAssigned
                    ? { label: "НАЗНАЧЕН", color: "red" }
                    : { label: "НЕ назначен", color: "green" }
                }
                disableItem={(bus) =>
                  bus.isAssigned ||
                  !!assignedBusesMap[bus.id] ||
                  ["UnderRepair", "LongTermRepair", "Decommissioned"].includes(bus.busStatus)
                }
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
                  placeholder="🔍 Поиск водителя..."
                />
                <SelectableList
                  items={filteredDrivers}
                  selected={selectedDriver}
                  onSelect={setSelectedDriver}
                  labelKey="fullName"
                  subLabelKey={(driver) => `№ ${driver.serviceNumber}`}
                  status={(driver) =>
                    driver.isAssigned
                      ? { label: "НАЗНАЧЕН", color: "red" }
                      : { label: "НЕ назначен", color: "green" }
                  }
                  disableItem={(driver) =>
                    driver.isAssigned ||
                    !!assignedDriversMap[driver.id] ||
                    !!globalAssignedDriversMap[driver.id] ||
                    ["OnVacation", "OnSickLeave", "Fired", "Intern"].includes(driver.driverStatus)
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter className="pt-6">
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
