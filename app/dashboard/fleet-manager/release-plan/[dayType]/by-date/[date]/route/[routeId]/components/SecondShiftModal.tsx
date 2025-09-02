"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, User, Calendar } from "lucide-react"

import SearchInput from "@/app/dashboard/fleet-manager/release-plan/components/SearchInput"
import SelectableList from "../components/SelectableList"
import DriverWorkHistory from "./driver/DriverWorkHistory"

import type { Departure } from "@/types/releasePlanTypes"
import type { DisplayDriver } from "@/types/driver.types"
import { driverService } from "@/service/driverService"
import { releasePlanService } from "@/service/releasePlanService"
import { busLineService } from "@/service/busLineService"
import { toast } from "@/components/ui/use-toast"

interface SecondShiftModalProps {
  isOpen: boolean
  onClose: () => void
  departure: Departure | null
  date: string
  convoyId: string
  routeId: string
  dispatchRouteId: string
  onSave: (driverId: string, shiftTime: string) => void
  onSuccess?: () => void
}

export default function SecondShiftModal({
  isOpen,
  onClose,
  departure,
  date,
  convoyId,
  dispatchRouteId,
  onSave,
  onSuccess,
}: SecondShiftModalProps) {
  const [search, setSearch] = useState("")
  const [availableDrivers, setAvailableDrivers] = useState<DisplayDriver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null)
  const [shiftStartTime, setShiftStartTime] = useState("")
  const [scheduleStartTime, setScheduleStartTime] = useState("")
  const [forceDriverMode, setForceDriverMode] = useState(false)

  useEffect(() => {
    if (!departure || !isOpen) return

    const fetchDrivers = async () => {
      const res = forceDriverMode
        ? await driverService.getAll()
        : await driverService.getFreeDrivers(date, convoyId, departure.bus?.id ?? undefined)

      if (res.isSuccess && res.value) {
        const drivers = res.value.map((d: any) => ({
          ...d,
          driverStatus: d.driverStatus || "DayOff",
          isAssigned: forceDriverMode ? false : d.isBusy ?? false,
        }))
        setAvailableDrivers(drivers)
      }
    }

    fetchDrivers()
    setSearch("")
    setSelectedDriver(null)
    setShiftStartTime("")
    setScheduleStartTime("")
  }, [departure, isOpen, date, convoyId, forceDriverMode])

  const isValidTime = (value: string) => /^\d{2}:\d{2}$/.test(value)

  const ensureHHMMSS = (v?: string | null): string => {
    if (!v) return "00:00:00"
    if (/^\d{2}:\d{2}:\d{2}$/.test(v)) return v
    if (/^\d{2}:\d{2}$/.test(v)) return `${v}:00`
    return "00:00:00"
  }

  const handleSave = async () => {
    if (!departure || !selectedDriver || !isValidTime(shiftStartTime) || !isValidTime(scheduleStartTime)) {
      toast({ title: "Проверьте оба времени и водителя", variant: "destructive" })
      return
    }

    if (!departure.busLine?.id) {
      toast({ title: "Не найден ID выхода (busLine)", variant: "destructive" })
      return
    }

    try {
      // 1. Локальное обновление UI
      onSave(selectedDriver.id, shiftStartTime)

      // 2. PATCH пересменки через новый API
      await busLineService.updateShiftChangeTime(
        departure.busLine.id,
        ensureHHMMSS(scheduleStartTime),
        ensureHHMMSS(shiftStartTime)
      )
      

      // 3. Обновление маршрута — на всякий случай
      const busLinePayload = {
        id: departure.busLine.id,
        busId: departure.bus?.id ?? null,
        driver1Id: departure.driver?.id ?? null,
        driver2Id: selectedDriver.id,
        departureTime: ensureHHMMSS(departure.departureTime),
        endTime: ensureHHMMSS(departure.endTime),
        scheduleStart: ensureHHMMSS(scheduleStartTime),
        scheduleShiftChange: ensureHHMMSS(shiftStartTime),
      }

      console.log("[🕒 Обновление графика маршрута]", busLinePayload)

      const routeRes = await releasePlanService.updateDispatchRoute({
        dispatchRouteId,
        busLines: [busLinePayload],
      })

      if (!routeRes.isSuccess) throw new Error(routeRes.error || "Ошибка при обновлении графика")

      // 4. Назначение второго водителя
      const assignRes = await releasePlanService.updateBusLineAssignment(date, {
        dispatchBusLineId: departure.id,
        busId: departure.bus?.id ?? null,
        driver1Id: departure.driver?.id ?? null,
        driver2Id: selectedDriver.id,
      })

      if (!assignRes.isSuccess) throw new Error(assignRes.error || "Ошибка при назначении водителя")

      toast({ title: "Водитель 2-й смены успешно назначен" })
      onClose()
      onSuccess?.()
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Неизвестная ошибка"
      console.error("[❌ Ошибка 2-й смены]:", e)
      toast({ title: "Ошибка", description: msg, variant: "destructive" })
    }
  }

  const filteredDrivers = availableDrivers.filter(driver =>
    driver.fullName.toLowerCase().includes(search.toLowerCase()) ||
    driver.serviceNumber.toLowerCase().includes(search.toLowerCase())
  )

  if (!departure) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[70vw] !max-w-[1200px] !max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <User className="w-6 h-6" />
            Назначение второй смены
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Водитель и времена */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Выбор водителя
                  </CardTitle>
                  {!forceDriverMode && (
                    <Button variant="outline" size="sm" onClick={() => { setForceDriverMode(true); setSelectedDriver(null) }}>
                      Принудительно назначить
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Поиск</Label>
                <SearchInput value={search} onChange={setSearch} placeholder="🔍 Введите имя или табельный номер..." />
                <div className="max-h-64 overflow-y-auto border rounded-md bg-gray-50">
                  <SelectableList
                    items={filteredDrivers}
                    selected={selectedDriver}
                    onSelect={setSelectedDriver}
                    labelKey="fullName"
                    subLabelKey={(d) => `№ ${d.serviceNumber}`}
                    status={(d) => d.isAssigned ? { label: "НАЗНАЧЕН", color: "red" } : { label: "НЕ назначен", color: "green" }}
                    disableItem={(d) =>
                      d.isAssigned || ["OnVacation", "OnSickLeave", "Fired", "Intern"].includes(d.driverStatus)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base"><Clock className="inline w-4 h-4 mr-2" />Время выхода на маршрут</CardTitle></CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={scheduleStartTime}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "")
                    if (value.length >= 3) value = value.slice(0, 2) + ":" + value.slice(2, 4)
                    if (value.length > 5) value = value.slice(0, 5)
                    setScheduleStartTime(value)
                  }}
                  placeholder="07:00"
                  className="w-full border rounded-lg p-3 text-lg font-mono"
                  maxLength={5}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base"><Clock className="inline w-4 h-4 mr-2" />Время пересменки</CardTitle></CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={shiftStartTime}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "")
                    if (value.length >= 3) value = value.slice(0, 2) + ":" + value.slice(2, 4)
                    if (value.length > 5) value = value.slice(0, 5)
                    setShiftStartTime(value)
                  }}
                  placeholder="11:30"
                  className="w-full border rounded-lg p-3 text-lg font-mono"
                  maxLength={5}
                />
              </CardContent>
            </Card>
          </div>

          {/* История работы */}
          <div className="space-y-6">
            {selectedDriver ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    История работы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DriverWorkHistory
                    driverId={selectedDriver.id}
                    defaultStartDate={date}
                    defaultDays={7}
                    title={selectedDriver.fullName}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="text-center text-gray-500 p-8">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  Выберите водителя для просмотра истории
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Separator className="my-6" />
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button
            onClick={handleSave}
            disabled={!selectedDriver || !isValidTime(shiftStartTime) || !isValidTime(scheduleStartTime)}
            className="px-8 bg-blue-600 hover:bg-blue-700"
          >
            <User className="w-4 h-4 mr-2" /> Назначить водителя
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
