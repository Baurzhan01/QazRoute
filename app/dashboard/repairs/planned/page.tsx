"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Plus, CalendarIcon } from "lucide-react"
import AssignRepairDialog from "./components/AssignRepairDialog"
import RepairTable from "./components/RepairTable"
import { usePlannedRepairs } from "./hooks/usePlannedRepairs"
import { getAuthData } from "@/lib/auth-utils"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import { useSearchParams } from "next/navigation"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function PlannedRepairPage() {
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const searchParams = useSearchParams()
  const dateParam = searchParams?.get("date")
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return dateParam ? new Date(dateParam) : new Date()
  })

  const {
    repairs,
    isLoading,
    fetchRepairs,
    assignRepair,
    deleteRepair,
    updateRepair,
  } = usePlannedRepairs(selectedDate)

  const [buses, setBuses] = useState<DisplayBus[]>([])
  const [drivers, setDrivers] = useState<DisplayDriver[]>([])

  const convoyId = getAuthData()?.convoyId ?? ""
  const dateStr = selectedDate.toLocaleDateString("sv-SE")

  useEffect(() => {
    const fetch = async () => {
      const [busData, driverData] = await Promise.all([
        busService.getFreeBuses(dateStr, convoyId),
        driverService.getFreeDrivers(dateStr, convoyId),
      ])
      setBuses(busData)
      setDrivers(driverData.value ?? [])
    }
    fetch()
  }, [dateStr, convoyId])

  const handleOpenAssignDialog = () => setAssignModalOpen(true)
  const handleAssignSaved = async () => {
    setAssignModalOpen(false)
    await fetchRepairs()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Плановый ремонт</h1>
          <p className="text-muted-foreground text-sm">
            Дата: {format(selectedDate, "PPP", { locale: ru })}
          </p>
        </div>

        <div className="flex gap-2">
          {dateParam && (
            <Button
              variant="secondary"
              onClick={() =>
                window.location.href = `/dashboard/fleet-manager/release-plan/workday/by-date/${dateParam}/final-dispatch`
              }
            >
              ← Назад к разнарядке
            </Button>
          )}
          <Button onClick={handleOpenAssignDialog}>
            <Plus className="h-4 w-4 mr-2" /> Назначить ремонт
          </Button>
        </div>
      </div>

      {/* Выпадающий календарь */}
      <div className="bg-white rounded-lg border p-4 max-w-[320px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate
                ? format(selectedDate, "PPP", { locale: ru })
                : <span>Выберите дату</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <RepairTable
        repairs={repairs}
        isLoading={isLoading}
        onDelete={deleteRepair}
        onUpdate={updateRepair}
        date={dateStr}
        convoyId={convoyId}
        buses={buses}
        drivers={drivers}
        onReload={fetchRepairs}
      />

      <AssignRepairDialog
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        date={selectedDate}
        onSaved={handleAssignSaved}
      />
    </div>
  )
}
