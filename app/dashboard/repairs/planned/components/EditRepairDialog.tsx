"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import SelectableList from "@/app/dashboard/fleet-manager/release-plan/components/SelectableList"
import SearchInput from "@/app/dashboard/fleet-manager/release-plan/components/SearchInput"
import { useDebounce } from "../../../utils/useDebounce"
import { toast } from "@/components/ui/use-toast"

import type { DisplayBus, DisplayDriver } from "@/types/driver.types"
import { repairService } from "@/service/repairService"

interface EditRepairDialogProps {
  open: boolean
  onClose: () => void
  date: string
  bus: DisplayBus
  driver: DisplayDriver
  description: string
  convoyId: string
  buses: DisplayBus[]
  drivers: DisplayDriver[]
  onUpdated: () => void
}

export default function EditRepairDialog({
  open,
  onClose,
  date,
  bus,
  driver,
  description,
  convoyId,
  buses,
  drivers,
  onUpdated,
}: EditRepairDialogProps) {
  const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(bus)
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(driver)
  const [notes, setNotes] = useState(description)

  const [busSearch, setBusSearch] = useState("")
  const [driverSearch, setDriverSearch] = useState("")
  const debouncedBusSearch = useDebounce(busSearch, 300)
  const debouncedDriverSearch = useDebounce(driverSearch, 300)

  const filteredBuses = buses.filter((b) =>
    b.govNumber.toLowerCase().includes(debouncedBusSearch.toLowerCase())
  )

  const filteredDrivers = drivers.filter((d) =>
    d.fullName.toLowerCase().includes(debouncedDriverSearch.toLowerCase())
  )

  const handleUpdate = async () => {
    if (!selectedBus || !selectedDriver) {
      toast({ title: "Выберите и автобус, и водителя", variant: "destructive" })
      return
    }

    const res = await repairService.updateRepair(date, convoyId, {
      busId: selectedBus.id,
      driverId: selectedDriver.id,
      description: notes,
    })

    if (res.isSuccess) {
      toast({ title: "Запись успешно обновлена" })
      onUpdated()
      onClose()
    } else {
      toast({ title: "Ошибка при обновлении", description: res.error || "", variant: "destructive" })
    }
  }

  useEffect(() => {
    setSelectedBus(bus)
    setSelectedDriver(driver)
    setNotes(description)
  }, [bus, driver, description, open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Редактировать ремонт</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Автобус</Label>
            <SearchInput
              value={busSearch}
              onChange={setBusSearch}
              placeholder="Поиск по номеру"
            />
            <SelectableList
            items={filteredDrivers}
            selected={selectedDriver}
            onSelect={(driver) => setSelectedDriver(driver)}
            labelRender={(driver) => `${driver.fullName} (${driver.serviceNumber})`}
            />
          </div>

          <div>
            <Label>Водитель</Label>
            <SearchInput
              value={driverSearch}
              onChange={setDriverSearch}
              placeholder="Поиск по ФИО"
            />
            <SelectableList
            items={filteredDrivers}
            selected={selectedDriver}
            onSelect={(driver) => setSelectedDriver(driver)}
            labelRender={(driver) => `${driver.fullName} (${driver.serviceNumber})`}
            />
          </div>
        </div>

        <div>
          <Label>Описание</Label>
          <Textarea
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleUpdate}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
