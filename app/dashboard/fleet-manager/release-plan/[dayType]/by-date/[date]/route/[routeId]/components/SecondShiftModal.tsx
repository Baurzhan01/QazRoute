"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
import { toast } from "@/components/ui/use-toast"

interface SecondShiftModalProps {
  isOpen: boolean
  onClose: () => void
  departure: Departure | null
  date: string
  convoyId: string
  routeId: string
  onSave: (driverId: string, shiftTime: string) => void;
  onSuccess?: () => void
}

export default function SecondShiftModal({
  isOpen,
  onClose,
  departure,
  date,
  convoyId,
  routeId,
  onSave,
  onSuccess,
}: SecondShiftModalProps) {
  const [search, setSearch] = useState("")
  const [availableDrivers, setAvailableDrivers] = useState<DisplayDriver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null)
  const [shiftStartTime, setShiftStartTime] = useState("") // "HH:mm"
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
          fullName: d.fullName,
          serviceNumber: d.serviceNumber,
          driverStatus: d.driverStatus || "DayOff",
          isAssigned: forceDriverMode ? false : d.isBusy ?? false,
        }))
        setAvailableDrivers(drivers)
      }
    }

    fetchDrivers()
    setSearch("")
    setSelectedDriver(null)
    setShiftStartTime(
      departure.busLine?.shiftChangeTime
        ? departure.busLine.shiftChangeTime.substring(0, 5)
        : ""
    )
  }, [departure, isOpen, date, convoyId, forceDriverMode])

  const isValidTime = (value: string) => /^\d{2}:\d{2}$/.test(value)

  const ensureHHMMSS = (v?: string | null): string => {
    if (!v) return "00:00:00"
    if (/^\d{2}:\d{2}:\d{2}$/.test(v)) return v
    if (/^\d{2}:\d{2}$/.test(v)) return `${v}:00`
    return "00:00:00"
  }

  const handleSave = async () => {
    if (!departure || !selectedDriver || !isValidTime(shiftStartTime)) {
      toast({ title: "Проверьте водителя и время", variant: "destructive" })
      return
    }

    try {
      // 🔹 Локально сохраняем
      onSave(selectedDriver.id, shiftStartTime)

      // 🔹 Сначала обновляем график выхода с временем пересменки
      const routePayload = {
        dispatchRouteId: routeId,
        busLines: [
          {
            id: departure.id,
            busId: departure.bus?.id ?? null,
            driver1Id: departure.driver?.id ?? null,
            driver2Id: selectedDriver.id,
            departureTime: ensureHHMMSS(departure.departureTime),
            endTime: ensureHHMMSS(departure.endTime),
            scheduleStart: departure.busLine?.exitTime ? ensureHHMMSS(departure.busLine.exitTime) : undefined,
            scheduleShiftChange: shiftStartTime ? ensureHHMMSS(shiftStartTime) : undefined,
          }
        ]
      }

      console.log("[🕒] Updating dispatch route schedule:", routePayload)
      const routeRes = await releasePlanService.updateDispatchRoute(routePayload)
      if (!routeRes.isSuccess) throw new Error(routeRes.error || "Ошибка при обновлении графика")

      // 🔹 Затем назначаем 2-го водителя
      const assignRes = await releasePlanService.updateBusLineAssignment(date, {
        dispatchBusLineId: departure.id,
        busId: departure.bus?.id ?? null,
        driver1Id: departure.driver?.id ?? null,
        driver2Id: selectedDriver.id,
      })

      if (!assignRes.isSuccess) throw new Error(assignRes.error || "Ошибка при назначении водителя")

      toast({ title: "Водитель 2-й смены назначен" })
      onClose()
      onSuccess?.()
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "Неизвестная ошибка при назначении 2-й смены"
      console.error("[❌ Ошибка 2-й смены]:", e)
      toast({ title: "Ошибка при назначении", description: msg, variant: "destructive" })
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
          {/* Водитель */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Выбор водителя
                  </CardTitle>
                  {!forceDriverMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setForceDriverMode(true)
                        setSelectedDriver(null)
                      }}
                    >
                      Принудительно назначить
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label className="text-sm font-medium">Поиск</Label>
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="🔍 Введите имя или табельный номер..."
                />

                <div className="max-h-64 overflow-y-auto border rounded-md bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <SelectableList
                    items={filteredDrivers}
                    selected={selectedDriver}
                    onSelect={setSelectedDriver}
                    labelKey="fullName"
                    subLabelKey={(d) => `№ ${d.serviceNumber}`}
                    status={(d) =>
                      d.isAssigned
                        ? { label: "НАЗНАЧЕН", color: "red" }
                        : { label: "НЕ назначен", color: "green" }
                    }
                    disableItem={(d) =>
                      d.isAssigned ||
                      ["OnVacation", "OnSickLeave", "Fired", "Intern"].includes(d.driverStatus)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Время пересменки */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Время пересменки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label className="text-sm font-medium">Когда второй водитель выходит на линию</Label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-lg font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="1130"
                    value={shiftStartTime}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "")
                      if (value.length >= 3) value = value.slice(0, 2) + ":" + value.slice(2, 4)
                      if (value.length > 5) value = value.slice(0, 5)
                      setShiftStartTime(value)
                    }}
                    maxLength={5}
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">Например: 11:30</p>

                {departure.busLine?.shiftChangeTime && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>Текущее:</strong> {departure.busLine.shiftChangeTime.substring(0, 5)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* История работы */}
          <div className="space-y-6">
            {selectedDriver ? (
              <Card>
                <CardHeader className="pb-3">
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
                    title={`${selectedDriver.fullName}`}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Выберите водителя для просмотра истории</p>
                  </div>
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
            disabled={!selectedDriver || !isValidTime(shiftStartTime)}
            className="px-8 bg-blue-600 hover:bg-blue-700"
          >
            <User className="w-4 h-4 mr-2" />
            Назначить водителя
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
