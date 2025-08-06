"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import ReplaceDriverDialog from "./ReplaceDriverDialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getAuthData } from "@/lib/auth-utils"
import { convoyService } from "@/service/convoyService"
import { releasePlanService } from "@/service/releasePlanService"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { busService } from "@/service/busService"
import type { FinalDispatchForRepair, ReserveAssignmentUI } from "@/types/releasePlanTypes"
import type { RepairDto } from "@/types/repair.types"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"
import { repairService } from "@/service/repairService"

interface AssignUnplannedRepairModalProps {
  open: boolean
  onClose: () => void
  date: Date
  onSuccess?: () => void
}

type EnrichedReserveAssignment = ReserveAssignmentUI & {
  driverId?: string
  driverFullName?: string
  govNumber?: string
  garageNumber?: string
  busId?: string
}

interface DisplayAssignment {
  dispatchBusLineId: string
  busId?: string
  driverId?: string
  bus?: { id: string; govNumber: string; garageNumber: string }
  driver?: { id: string; fullName: string }
  routeNumber?: string
  isReserve?: boolean
  reserveStatus?: "Reserved" | "Order"
}

export default function AssignUnplannedRepairModal({
  open,
  onClose,
  date,
  onSuccess,
}: AssignUnplannedRepairModalProps) {
  const [convoyId, setConvoyId] = useState("")
  const [convoys, setConvoys] = useState<{ id: string; number: number }[]>([])
  const [dispatchItems, setDispatchItems] = useState<DisplayAssignment[]>([])
  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])
  const [selectedItemId, setSelectedItemId] = useState("")
  const [reason, setReason] = useState("")
  const [mileage, setMileage] = useState("")
  const [isMileageEdited, setIsMileageEdited] = useState(false)
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [scheduledRepairs, setScheduledRepairs] = useState<RepairDto[]>([])
  const [isLaunchedFromGarage, setIsLaunchedFromGarage] = useState(false);

  const auth = getAuthData()
  const depotId = auth?.busDepotId ?? ""
  const formattedDate = format(date, "yyyy-MM-dd")
  const currentTime = new Date().toTimeString().slice(0, 5) + ":00"

  useEffect(() => {
    if (!open) return
    setConvoyId("")
    setReason("")
    setMileage("")
    setIsMileageEdited(false)
    setSelectedItemId("")
    setSearch("")
    setDispatchItems([])
    convoyService.getByDepotId(depotId).then((res) => {
      if (res.isSuccess) setConvoys(res.value ?? [])
    })
    setTimeout(() => searchRef.current?.focus(), 100)
  }, [open, depotId])

  useEffect(() => {
    if (!convoyId) return

    const fetchAll = async () => {
      setIsLoading(true)
    
      const [dispatchRes, repairsRes, scheduledRepairsRes] = await Promise.all([
        releasePlanService.getFullDispatchByDate(formattedDate, convoyId),
        routeExitRepairService.getByDate(formattedDate, depotId),
        repairService.getRepairsByDate(formattedDate, convoyId),
      ])
    
      const items: DisplayAssignment[] = []
    
      // 🛠 Плановый ремонт
      let scheduledRepairItems: DisplayAssignment[] = []
      if (scheduledRepairsRes.isSuccess && scheduledRepairsRes.value) {
        setScheduledRepairs(scheduledRepairsRes.value)
    
        scheduledRepairItems = scheduledRepairsRes.value
          .filter(r => r.bus?.id)
          .map((r) => ({
            dispatchBusLineId: `scheduled-${r.id}`,
            busId: r.bus!.id,
            driverId: r.driver?.id,
            bus: {
              id: r.bus!.id,
              govNumber: r.bus!.govNumber,
              garageNumber: r.bus!.garageNumber,
            },
            driver: r.driver ?? {
              id: "",
              fullName: "–",
            },
            routeNumber: "Плановый ремонт",
            isReserve: false,
          }))
      }
    
      // 📋 Выходы по маршрутам и резерв
      if (dispatchRes.isSuccess && dispatchRes.value) {
        const dispatch = dispatchRes.value as unknown as FinalDispatchForRepair
    
        const busLineItems = dispatch.routes?.flatMap((route) =>
          route.busLines?.map((line) => ({
            dispatchBusLineId: line.dispatchBusLineId,
            busId: line.bus?.id,
            driverId: line.firstDriver?.id,
            bus: line.bus,
            driver: line.firstDriver,
            routeNumber: route.routeNumber,
          })) ?? []
        ) ?? []
    
        const reserveItems = (dispatch.reserves as EnrichedReserveAssignment[]).map((r) => ({
          dispatchBusLineId: r.id,
          busId: r.busId ?? undefined,
          driverId: r.driverId ?? undefined,
          bus: r.busId
            ? {
                id: r.busId,
                govNumber: r.govNumber,
                garageNumber: r.garageNumber,
              }
            : undefined,
          driver: {
            id: r.driverId ?? "",
            fullName: r.driverFullName ?? "–",
          },
          routeNumber: r.status === "Reserved" ? "С резерва" : "С заказа",
          isReserve: true,
          reserveStatus: r.status,
        }))
    
        items.push(...busLineItems, ...reserveItems, ...scheduledRepairItems)
      }
    
      // 🧰 Уже назначенные ремонты
      if (repairsRes.isSuccess && repairsRes.value) {
        setRepairs(repairsRes.value)
      }
    
      setDispatchItems(items)
      setIsLoading(false)
    }
    

    fetchAll()
  }, [convoyId, formattedDate])

  useEffect(() => {
    const fetchBusMileage = async () => {
      const selected = dispatchItems.find((i) => i.dispatchBusLineId === selectedItemId)
      if (!selected?.busId || isMileageEdited) return

      const res = await busService.getById(selected.busId)
      if (res.isSuccess) {
        const busMileage = res.value?.mileage
        setMileage(busMileage != null ? String(busMileage) : "0")
      } else {
        setMileage("0")
      }
    }

    fetchBusMileage()
  }, [selectedItemId, dispatchItems, isMileageEdited])

  const handleDriverReplaced = (newDriverId: string, newDriverName: string) => {
    setDispatchItems((prev) =>
      prev.map((item) =>
        item.dispatchBusLineId === selectedItemId
          ? {
              ...item,
              driverId: newDriverId,
              driver: { id: newDriverId, fullName: newDriverName },
            }
          : item
      )
    )
  }

  const isAlreadyInRepair = (item: DisplayAssignment): boolean => {
    return repairs.some(
      (r) =>
        r.dispatchBusLineId === item.dispatchBusLineId ||
        (r.bus?.id === item.busId && r.driver?.id === item.driverId)
    )
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()

    const result = !q
      ? dispatchItems
      : dispatchItems.filter(
          (i) =>
            i.driver?.fullName?.toLowerCase().includes(q) ||
            i.bus?.govNumber?.toLowerCase().includes(q) ||
            i.bus?.garageNumber?.toLowerCase().includes(q) ||
            i.routeNumber?.toLowerCase().includes(q)
        )

    return result.sort((a, b) => (a.driver?.fullName || "").localeCompare(b.driver?.fullName || ""))
  }, [dispatchItems, search])

  const handleSave = async () => {
    const selected = dispatchItems.find((i) => i.dispatchBusLineId === selectedItemId)
    if (!selected) {
      return toast({ title: "Не выбран выход", variant: "destructive" })
    }

    const isScheduledRepairItem = selected.dispatchBusLineId.startsWith("scheduled-")
    const matchedRepair = scheduledRepairs.find((r) => r.bus?.id === selected.busId)
    const repairId = matchedRepair?.id ?? null

    if (!reason.trim()) {
      return toast({ title: "Укажите причину неисправности", variant: "destructive" })
    }
    if (!mileage) {
      return toast({ title: "Укажите пробег", variant: "destructive" })
    }
    
    const finalReason = `<b style='color:red;'>${isLaunchedFromGarage ? "Сход с гаража." : "Сход с линии."}</b><br>${reason.trim()}`;
    

    const result = await routeExitRepairService.create({
      startDate: formattedDate,
      startTime: currentTime,
      andDate: null,
      andTime: null,
      dispatchBusLineId: isScheduledRepairItem ? null : (selected.isReserve ? null : selectedItemId),
      reserveId: isScheduledRepairItem ? null : (selected.isReserve ? selectedItemId : null),
      repairId: repairId,
      isExist: true,
      text: finalReason, // ✅ вот здесь используем отформатированную строку
      mileage: parseInt(mileage, 10),
      isLongRepair: false,
      repairType: "Unscheduled",
      isLaunchedFromGarage: isLaunchedFromGarage,
    })

    if (result.isSuccess) {
      toast({ title: "Неплановый ремонт создан" })
      onClose()
      onSuccess?.()
    } else {
      toast({ title: "Ошибка при создании", description: result.error || "", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Назначить неплановый ремонт</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Автоколонна</Label>
            <select
              className="w-full border rounded px-3 py-2"
              value={convoyId}
              onChange={(e) => setConvoyId(e.target.value)}
            >
              <option value="">Выберите автоколонну</option>
              {convoys.map((c) => (
                <option key={c.id} value={c.id}>
                  Колонна №{c.number}
                </option>
              ))}
            </select>
          </div>

          {!isLoading && (
            <>
              {dispatchItems.length > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label>Поиск</Label>
                      <Input
                        ref={searchRef}
                        placeholder="ФИО водителя, гос. номер, гаражный № или маршрут"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    {search && (
                      <Button variant="ghost" onClick={() => setSearch("")}>Очистить</Button>
                    )}
                  </div>

                  <ScrollArea className="h-[300px] overflow-y-auto border rounded-md divide-y">
                    {filteredItems.map((item, index) => {
                      const isFromScheduledRepair = scheduledRepairs.some(r => r.bus?.id === item.busId)
                      const disabled = isAlreadyInRepair(item)
                      return (
                        <div
                          key={`${item.dispatchBusLineId}-${index}`}
                          onClick={() => {
                            setSelectedItemId(item.dispatchBusLineId)
                            setIsMileageEdited(false)
                          }}
                          className={cn(
                            "cursor-pointer px-4 py-3 flex justify-between items-center transition-colors duration-150",
                            selectedItemId === item.dispatchBusLineId && "bg-muted border-l-4 border-primary",
                          )}
                        >
                          <div>
                            <p className="text-base font-medium">
                              🚌 Водитель: {item.driver?.fullName ?? "–"}
                            </p>
                            {item.driver && (
                                <button
                                  className="text-xs text-blue-600 underline mt-1"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedItemId(item.dispatchBusLineId)
                                    setReplaceDialogOpen(true)
                                  }}
                                >
                                  Заменить водителя
                                </button>
                              )}
                            <p className="text-sm text-muted-foreground">
                              🚣 {item.routeNumber?.startsWith("С ") ? (
                                <span className={cn(
                                  item.routeNumber === "С резерва" ? "text-red-500" : "text-blue-500"
                                )}>
                                  {item.routeNumber}
                                </span>
                              ) : (
                                <>Маршрут: {item.routeNumber ?? "–"}</>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              🚘 Автобус: {item.bus?.govNumber ?? "–"} / {item.bus?.garageNumber ?? "–"}
                            </p>
                          </div>
                          {selectedItemId === item.dispatchBusLineId && !disabled && (
                            <div className="text-green-600 text-xl font-bold">✅</div>
                          )}
                          {isFromScheduledRepair && (
                            <div className="text-indigo-600 text-xs font-medium ml-4">
                              🛠 Плановый ремонт
                            </div>
                          )}
                          {isAlreadyInRepair(item) && (
                            <div className="text-orange-500 text-xs font-medium ml-4">
                              ⚠ Повторный ремонт
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </ScrollArea>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Нет данных по выходам. Убедитесь, что выбрана автоколонна с разнарядкой на выбранную дату.
                </p>
              )}
            </>
          )}
          <div className="flex items-center gap-2">
          <Label>Тип схода</Label>
          <select
            className="w-full border rounded px-3 py-2"
            value={isLaunchedFromGarage ? "garage" : "line"}
            onChange={(e) => setIsLaunchedFromGarage(e.target.value === "garage")}
          >
            <option value="line">Сход с линии</option>
            <option value="garage">Сход с гаража</option>
          </select>
        </div>
          <div>
            <Label>Причина неисправности</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Например: Проблема с тормозами"
            />
          </div>
          <div>
            <Label>Пробег (в км)</Label>
            <Input
              type="number"
              value={mileage}
              onChange={(e) => {
                setMileage(e.target.value)
                setIsMileageEdited(true)
              }}
              placeholder="Например: 123456"
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
        {replaceDialogOpen && selectedItemId && (
            <ReplaceDriverDialog
            open={replaceDialogOpen}
            onClose={() => setReplaceDialogOpen(false)}
            dispatchBusLineId={selectedItemId}
            onSuccess={() => {
              setReplaceDialogOpen(false)
              toast({ title: "Водитель заменён" })
            }}
            onDriverReplaced={handleDriverReplaced}
          />
          )}
      </DialogContent>
    </Dialog>
  )
}
