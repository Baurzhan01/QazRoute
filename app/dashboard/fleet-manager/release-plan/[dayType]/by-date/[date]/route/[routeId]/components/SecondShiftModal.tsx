"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import SearchInput from "@/app/dashboard/fleet-manager/release-plan/components/SearchInput"
import SelectableList from "../components/SelectableList"
import type { Departure } from "@/types/dispatch.types"
import type { DisplayDriver } from "@/types/driver.types"
import { DRIVER_STATUS_MAP, getStatus } from "../../../../../../utils/statusUtils"
import { driverService } from "@/service/driverService"
import { releasePlanService } from "@/service/releasePlanService"
import { toast } from "@/components/ui/use-toast"

interface SecondShiftModalProps {
  isOpen: boolean
  onClose: () => void
  departure: Departure | null
  date: string
  convoyId: string
  onSave: (driverId: string, shiftTime: string) => void;
  onSuccess?: () => void
}

export default function SecondShiftModal({
  isOpen,
  onClose,
  departure,
  date,
  convoyId,
  onSuccess,
}: SecondShiftModalProps) {
  const [search, setSearch] = useState("")
  const [availableDrivers, setAvailableDrivers] = useState<DisplayDriver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null)
  const [shiftTime, setShiftTime] = useState("")

  useEffect(() => {
    if (!departure || !isOpen) return

    driverService.getFreeDrivers(date, convoyId).then(res => {
      setAvailableDrivers(res.value ?? [])
    })

    setSearch("")
    setSelectedDriver(null)
    setShiftTime("")
  }, [departure, isOpen, date, convoyId])

  const isValidTime = (value: string) => /^\d{2}:\d{2}$/.test(value)

  const handleSave = async () => {
    if (!departure || !selectedDriver || !isValidTime(shiftTime)) {
      toast({ title: "Проверьте водителя и время пересменки", variant: "destructive" })
      return
    }

    try {
      await releasePlanService.updateBusLineAssignment(date, {
        dispatchBusLineId: departure.id,
        driver1Id: departure.driver?.id ?? null,
        driver2Id: selectedDriver.id,
        busId: departure.bus?.id ?? null,
      })

      toast({ title: "Водитель 2-й смены назначен" })
      onClose()
      onSuccess?.()
    } catch (e) {
      toast({ title: "Ошибка при назначении", variant: "destructive" })
    }
  }

  const filteredDrivers = availableDrivers.filter(driver =>
    driver.fullName.toLowerCase().includes(search.toLowerCase())
  )

  if (!departure) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Назначение 2-й смены</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Водитель</Label>
            <SearchInput value={search} onChange={setSearch} placeholder="Поиск водителя..." />
            <SelectableList
              items={filteredDrivers}
              selected={selectedDriver}
              onSelect={setSelectedDriver}
              labelKey="fullName"
              subLabelKey={(d) => `№ ${d.serviceNumber}`}
              status={(d) => getStatus(DRIVER_STATUS_MAP, d.driverStatus)}
              disableItem={(d) => ["OnVacation", "OnSickLeave", "Fired", "Intern"].includes(d.driverStatus)}
            />
          </div>

          <div>
            <Label>Время пересменки</Label>
            <input
              type="text"
              className="w-full border rounded p-2"
              placeholder="HH:MM"
              value={shiftTime}
              onChange={(e) => setShiftTime(e.target.value)}
              maxLength={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave} disabled={!selectedDriver || !isValidTime(shiftTime)}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
