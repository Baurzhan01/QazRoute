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
import type { ReserveReplacementCandidate } from "@/types/releasePlanTypes"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle2 } from "lucide-react"

interface ReplaceAssignmentModalProps {
  open: boolean
  onClose: () => void
  selectedAssignment: { dispatchBusLineId: string; busId?: string; driverId?: string }
  date: string
  convoyId: string
  onReload?: () => void
}

export default function ReplaceAssignmentModal({
  open,
  onClose,
  selectedAssignment,
  date,
  convoyId,
  onReload,
}: ReplaceAssignmentModalProps) {
  const [tab, setTab] = useState("reserve")
  const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null)
  const [reserve, setReserve] = useState<ReserveReplacementCandidate[]>([])
  const [freeBuses, setFreeBuses] = useState<DisplayBus[]>([])
  const [freeDrivers, setFreeDrivers] = useState<DisplayDriver[]>([])
  const [searchText, setSearchText] = useState("")
  const [searchReserve, setSearchReserve] = useState("")

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
  
    const isFromReserve = reserve.some(
      (r) => r.driverId === selectedDriver?.id && r.busId === selectedBus?.id
    )
  
    const status = isFromReserve ? "Replaced" : "Permutation"
  
    try {
      await releasePlanService.replaceAssignment(
        selectedAssignment.dispatchBusLineId,
        true,
        status,
        selectedDriver?.id || selectedAssignment.driverId || "",
        selectedBus?.id || selectedAssignment.busId || ""
      )
  
      toast({
        title: "Назначение обновлено",
        description:
          status === "Replaced"
            ? "✅ Замена из резерва выполнена"
            : "🔄 Перестановка выполнена",
      })
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[65vw] max-w-none">
      <DialogHeader>
        <DialogTitle>Замена на выходе</DialogTitle>
        <p className="text-sm text-muted-foreground">
            Выберите водителя или автобус для замены на выбранном выходе
        </p>

        {selectedDriver && selectedBus && (
            <div
            className={`mt-2 rounded px-3 py-1 text-sm font-medium w-fit ${
                reserve.some((r) => r.driverId === selectedDriver.id && r.busId === selectedBus.id)
                ? "bg-yellow-100 text-red-700 border border-yellow-300"
                : "bg-blue-100 text-blue-700 border border-blue-300"
            }`}
            >
            {reserve.some((r) => r.driverId === selectedDriver.id && r.busId === selectedBus.id)
                ? "🔁 Выбрана замена из резерва"
                : "🔄 Выбрана перестановка"}
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
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
                  {filteredReserve.map((r, index) => (
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
                          busStatus: "Reserve",
                        })
                      }}
                      className={`cursor-pointer hover:bg-sky-50 ${
                        isSelected(r) ? "bg-green-100" : ""
                      }`}
                    >
                      <td className="border px-2 py-1 text-center">{index + 1}</td>
                      <td className="border px-2 py-1">{r.driverFullName}</td>
                      <td className="border px-2 py-1 text-center">{r.driverTabNumber}</td>
                      <td className="border px-2 py-1 text-center">{r.garageNumber}</td>
                      <td className="border px-2 py-1 text-center">{r.govNumber}</td>
                      <td className="border px-2 py-1">{r.description}</td>
                      <td className="border px-2 py-1 text-center">
                        {isSelected(r) ? (
                            <div className="flex items-center gap-1 text-yellow-700 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Замена</span>
                            </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
