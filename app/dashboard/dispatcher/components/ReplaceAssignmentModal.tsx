// ReplaceAssignmentModal.tsx (добавлен onReplaceSuccess)
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { driverService } from "@/service/driverService"
import { busService } from "@/service/busService"
import { releasePlanService } from "@/service/releasePlanService"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import type { ReserveReplacementCandidate, RouteAssignment } from "@/types/releasePlanTypes"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle2 } from "lucide-react"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"

interface ReplaceAssignmentModalProps {
    open: boolean
    onClose: () => void
    selectedAssignment: RouteAssignment
    date: string
    convoyId: string
    onReload?: () => void
    onReplaceSuccess?: (updated: RouteAssignment) => void
  }
  
  export default function ReplaceAssignmentModal({
    open,
    onClose,
    selectedAssignment,
    date,
    convoyId,
    onReload,
    onReplaceSuccess,
  }: ReplaceAssignmentModalProps) {
    const [tab, setTab] = useState("reserve")
    const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(null)
    const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null)
    const [reserve, setReserve] = useState<ReserveReplacementCandidate[]>([])
    const [freeBuses, setFreeBuses] = useState<DisplayBus[]>([])
    const [freeDrivers, setFreeDrivers] = useState<DisplayDriver[]>([])
    const [searchText, setSearchText] = useState("")
    const [searchReserve, setSearchReserve] = useState("")
  
    const statusEnumMap: Record<"Undefined" | "Released" | "Replaced" | "Permutation" | "Removed", number> = {
      Undefined: 0,
      Released: 1,
      Replaced: 2,
      Permutation: 3,
      Removed: 4,
    }
  
    useEffect(() => {
      if (!open || !date || !convoyId) return
      fetchReserve()
      fetchFreeBuses()
      fetchFreeDrivers()
    }, [open, date, convoyId])

    const fetchReserve = async () => {
        try {
          const res = await releasePlanService.getReserveReplacementsByDate(date, convoyId)
          setReserve(res.value || [])
        } catch {
          toast({ title: "Ошибка загрузки резерва", variant: "destructive" })
        }
      }
    
      const fetchFreeBuses = async () => {
        try {
          const res = await busService.getWeekendBuses(date, convoyId)
          setFreeBuses(res.value || [])
        } catch {
          toast({ title: "Ошибка загрузки автобусов", variant: "destructive" })
        }
      }
    
      const fetchFreeDrivers = async () => {
        try {
          const res = await driverService.getWeekendDrivers(date, convoyId)
          setFreeDrivers(res.value || [])
        } catch {
          toast({ title: "Ошибка загрузки водителей", variant: "destructive" })
        }
      }

      const handleConfirm = async () => {
        if (!selectedBus && !selectedDriver) {
          toast({ title: "Выберите водителя или автобус", variant: "destructive" })
          return
        }
      
        const isBusChanged = !!selectedBus && selectedBus.id !== selectedAssignment.bus?.id
        const isDriverChanged = !!selectedDriver && selectedDriver.id !== selectedAssignment.driver?.id
      
        const isFromReserve =
          selectedDriver && selectedBus &&
          reserve.some((r) => r.driverId === selectedDriver.id && r.busId === selectedBus.id)
      
        let status: "Replaced" | "Permutation" = "Permutation"
        if (isFromReserve) {
          status = "Replaced"
        } else if (isBusChanged || isDriverChanged) {
          status = "Permutation"
        } else {
          toast({ title: "Вы не выбрали другую замену", variant: "destructive" })
          return
        }
      
        try {
          const res = await releasePlanService.replaceAssignment(
            selectedAssignment.dispatchBusLineId,
            true,
            status,
            selectedDriver?.id || selectedAssignment.driver?.id || "",
            selectedBus?.id || selectedAssignment.bus?.id || ""
          )
      
          if (status === "Replaced") {
            const reserveEntry = reserve.find(
              (r) => r.driverId === selectedDriver?.id && r.busId === selectedBus?.id
            )
      
            if (reserveEntry) {
              // Удаляем резервную строку, которая пошла на маршрут
              await releasePlanService.removeFromReserve([reserveEntry.id])
            }
          }
      
          toast({
            title: "Назначение обновлено",
            description:
              status === "Replaced"
                ? "✅ Замена из резерва выполнена"
                : "🔄 Перестановка выполнена",
          })
      
          if (res?.value && onReplaceSuccess) {
            onReplaceSuccess({
              ...selectedAssignment,
              bus: selectedBus
                ? {
                    id: selectedBus.id,
                    garageNumber: selectedBus.garageNumber,
                    govNumber: selectedBus.govNumber,
                  }
                : selectedAssignment.bus,
              garageNumber: selectedBus?.garageNumber ?? selectedAssignment.garageNumber,
              stateNumber: selectedBus?.govNumber ?? selectedAssignment.stateNumber,
              driver: selectedDriver
                ? {
                    id: selectedDriver.id,
                    fullName: selectedDriver.fullName,
                    serviceNumber: selectedDriver.serviceNumber,
                  }
                : selectedAssignment.driver,
              status: status === "Replaced"
                ? DispatchBusLineStatus.Replaced
                : DispatchBusLineStatus.Permutation,
            })
          }
      
          onReload?.()
          onClose()
        } catch (error: any) {
          toast({ title: "Ошибка при замене", description: error.message, variant: "destructive" })
        }
      }      

  const isSelected = (r: ReserveReplacementCandidate) =>
    selectedDriver?.id === r.driverId && selectedBus?.id === r.busId

  const filteredReserve = useMemo(() => {
    return reserve.filter((r) => {
      const fullName = r.driverFullName?.toLowerCase() || ""
      const tabNumber = r.driverTabNumber?.toLowerCase() || ""
      const garage = r.garageNumber?.toLowerCase() || ""
      const gov = r.govNumber?.toLowerCase() || ""

      return (
        fullName.includes(searchReserve.toLowerCase()) ||
        tabNumber.includes(searchReserve.toLowerCase()) ||
        garage.includes(searchReserve.toLowerCase()) ||
        gov.includes(searchReserve.toLowerCase())
      )
    })
  }, [reserve, searchReserve])

  const filteredDrivers = useMemo(() => {
    const q = searchText.toLowerCase()
    return freeDrivers.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.serviceNumber.toLowerCase().includes(q)
    )
  }, [freeDrivers, searchText])

  const filteredBuses = useMemo(() => {
    const q = searchText.toLowerCase()
    return freeBuses.filter(
      (b) =>
        b.garageNumber.toLowerCase().includes(q) ||
        b.govNumber.toLowerCase().includes(q)
    )
  }, [freeBuses, searchText])

  const statusLabel = useMemo(() => {
    if (selectedDriver && selectedBus) {
      return reserve.some((r) => r.driverId === selectedDriver.id && r.busId === selectedBus.id)
        ? {
            label: "🔁 Выбрана замена из резерва",
            color: "bg-yellow-100 text-red-700 border-yellow-300",
          }
        : {
            label: "🔄 Выбрана перестановка",
            color: "bg-blue-100 text-blue-700 border-blue-300",
          }
    }
  
    if (selectedDriver || selectedBus) {
      return {
        label: "🔄 Выбрана перестановка",
        color: "bg-blue-100 text-blue-700 border-blue-300",
      }
    }
  
    return null
  }, [selectedDriver, selectedBus, reserve])
  

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[65vw] max-w-none">
        <DialogHeader>
          <DialogTitle>Замена на выходе</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Выберите водителя или автобус для замены на выбранном выходе
          </p>

          {statusLabel && (
            <div
              className={`mt-2 rounded px-3 py-1 text-sm font-medium w-fit border ${statusLabel.color}`}
            >
              {statusLabel.label}
            </div>
          )}
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList>
            <TabsTrigger value="reserve">Резерв</TabsTrigger>
            <TabsTrigger value="buses">Автобусы</TabsTrigger>
            <TabsTrigger value="drivers">Водители</TabsTrigger>
          </TabsList>

          <div className="my-2">
            <input
              type="text"
              placeholder="Поиск..."
              value={tab === "reserve" ? searchReserve : searchText}
              onChange={(e) => {
                tab === "reserve"
                  ? setSearchReserve(e.target.value)
                  : setSearchText(e.target.value)
              }}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>

          <TabsContent value="reserve">
        <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full border text-sm">
            <thead>
                <tr className="bg-sky-100 text-sky-800">
                <th className="border px-2 py-1">№</th>
                <th className="border px-2 py-1">ФИО</th>
                <th className="border px-2 py-1">Таб. номер</th>
                <th className="border px-2 py-1">Гараж</th>
                <th className="border px-2 py-1">Гос. номер</th>
                <th className="border px-2 py-1">Причина</th>
                <th className="border px-2 py-1">Выбор</th>
                </tr>
            </thead>
            <tbody>
                {filteredReserve.map((r, index) => {
                const isRemoved = r.description?.toLowerCase().includes("снят с маршрута")
                const isRowSelected = isSelected(r)
                const isGoneToRoute =
                  !isRemoved &&
                  !reserve.some((entry) => entry.driverId === r.driverId && entry.busId === r.busId)

                return (
                    <tr
                    key={r.id}
                    onClick={() => {
                        if (!r.driverId || !r.busId) return
                        setSelectedDriver({
                        id: r.driverId,
                        fullName: r.driverFullName,
                        serviceNumber: r.driverTabNumber,
                        driverStatus: "OnWork",
                        })
                        setSelectedBus({
                        id: r.busId,
                        garageNumber: r.garageNumber,
                        govNumber: r.govNumber,
                        status: "Reserve",
                        })
                    }}
                    className={`cursor-pointer hover:bg-sky-50 ${
                      isRowSelected ? "bg-green-100" :
                      isRemoved ? "bg-red-50" :
                      isGoneToRoute ? "bg-red-100/50" : ""
                    }`}
                    >
                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                    <td className="border px-2 py-1">{r.driverFullName}</td>
                    <td className="border px-2 py-1 text-center">{r.driverTabNumber}</td>
                    <td className="border px-2 py-1 text-center">{r.garageNumber}</td>
                    <td className="border px-2 py-1 text-center">{r.govNumber}</td>
                    <td className="border px-2 py-1">{r.description}</td>
                    <td className="border px-2 py-1 text-center">
                        {isRowSelected && (
                        <div className="flex items-center gap-1 text-yellow-700 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Замена</span>
                        </div>
                        )}
                    </td>
                    </tr>
                )
                })}
            </tbody>
            </table>

            <div className="text-xs text-muted-foreground mt-1 px-1">
            <div>
                <span className="inline-block w-3 h-3 bg-green-100 border mr-2 align-middle" />
                выбрана строка для замены
            </div>
            <div>
                <span className="inline-block w-3 h-3 bg-red-50 border mr-2 align-middle" />
                снят(а) с маршрута
            </div>
            </div>
        </div>
        </TabsContent>


          <TabsContent value="buses">
            <div className="grid grid-cols-2 gap-2 mt-3 max-h-[400px] overflow-y-auto">
              {filteredBuses.map((b) => (
                <div
                  key={b.id}
                  className={`p-2 border rounded cursor-pointer hover:bg-gray-100 ${
                    selectedBus?.id === b.id ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelectedBus(b)}
                >
                  <div className="font-semibold">{b.garageNumber}</div>
                  <div className="text-sm text-gray-600">{b.govNumber}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="drivers">
            <div className="grid grid-cols-2 gap-2 mt-3 max-h-[400px] overflow-y-auto">
              {filteredDrivers.map((d) => (
                <div
                  key={d.id}
                  className={`p-2 border rounded cursor-pointer hover:bg-gray-100 ${
                    selectedDriver?.id === d.id ? "bg-green-100" : ""
                  }`}
                  onClick={() => setSelectedDriver(d)}
                >
                  <div className="font-semibold">{d.fullName}</div>
                  <div className="text-sm text-gray-600">Таб №: {d.serviceNumber}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleConfirm} disabled={!selectedBus && !selectedDriver}>
            Заменить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
