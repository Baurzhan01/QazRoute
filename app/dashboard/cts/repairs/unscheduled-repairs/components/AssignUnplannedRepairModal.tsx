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
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getAuthData } from "@/lib/auth-utils"
import { convoyService } from "@/service/convoyService"
import { releasePlanService } from "@/service/releasePlanService"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import type { FinalDispatchForRepair, ReserveAssignmentUI } from "@/types/releasePlanTypes"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

interface AssignUnplannedRepairModalProps {
  open: boolean
  onClose: () => void
  date: Date
  onSuccess?: () => void
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
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const auth = getAuthData()
  const depotId = auth?.busDepotId ?? ""
  const formattedDate = format(date, "yyyy-MM-dd")
  const currentTime = new Date().toTimeString().slice(0, 5) + ":00"

  useEffect(() => {
    if (!open) return
    setConvoyId("")
    setReason("")
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

      const [dispatchRes, repairsRes] = await Promise.all([
        releasePlanService.getFullDispatchByDate(formattedDate, convoyId),
        routeExitRepairService.getByDate(formattedDate, depotId),
      ])

      const items: DisplayAssignment[] = []

      if (dispatchRes.isSuccess && dispatchRes.value) {
        const dispatch = dispatchRes.value as unknown as FinalDispatchForRepair
        const busLineItems: DisplayAssignment[] = dispatch.routes?.flatMap((route) =>
          route.busLines?.map((line) => ({
            dispatchBusLineId: line.dispatchBusLineId,
            busId: line.bus?.id,
            driverId: line.firstDriver?.id,
            bus: line.bus,
            driver: line.firstDriver,
            routeNumber: route.routeNumber,
          })) ?? []
        ) ?? []

        const reserveItems: DisplayAssignment[] = dispatch.reserves?.map((r: ReserveAssignmentUI) => ({
          dispatchBusLineId: r.id,
          busId: r.busId ?? undefined,
          driverId: r.driver?.id ?? undefined,
          bus: r.busId
            ? {
                id: r.busId,
                govNumber: r.govNumber,
                garageNumber: r.garageNumber,
              }
            : undefined,
          driver: r.driver
            ? {
                id: r.driver.id,
                fullName: r.driver.fullName,
              }
            : undefined,
          routeNumber: r.status === "Reserved" ? "С резерва" : "С заказа",
          isReserve: true,
          reserveStatus: r.status,
        })) ?? []

        items.push(...busLineItems, ...reserveItems)
      }

      if (repairsRes.isSuccess && repairsRes.value) {
        setRepairs(repairsRes.value)
      }

      setDispatchItems(items)
      setIsLoading(false)
    }

    fetchAll()
  }, [convoyId, formattedDate])

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
    if (!selected) return toast({ title: "Не выбран выход", variant: "destructive" })
    if (!reason.trim()) return toast({ title: "Укажите причину неисправности", variant: "destructive" })
  
    const result = await routeExitRepairService.create({
      startDate: formattedDate,
      startTime: currentTime,
      andDate: null,
      andTime: null,
      dispatchBusLineId: selected?.isReserve ? null : selectedItemId,
      reserveId: selected?.isReserve ? selectedItemId : null,
      isExist: true,
      text: reason,
      mileage: 0,
      isLongRepair: false,
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
                      const disabled = isAlreadyInRepair(item)
                      return (
                        <div
                          key={`${item.dispatchBusLineId}-${index}`}
                          onClick={() => setSelectedItemId(item.dispatchBusLineId)}
                          className={cn(
                            "cursor-pointer px-4 py-3 flex justify-between items-center transition-colors duration-150",
                            selectedItemId === item.dispatchBusLineId && "bg-muted border-l-4 border-primary",
                          )}
                        >
                          <div>
                            <p className="text-base font-medium">
                              🚌 Водитель: {item.driver?.fullName ?? "–"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              🛣 {item.routeNumber?.startsWith("С ") ? (
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
                              🚐 Автобус: {item.bus?.govNumber ?? "–"} / {item.bus?.garageNumber ?? "–"}
                            </p>
                          </div>
                          {selectedItemId === item.dispatchBusLineId && !disabled && (
                            <div className="text-green-600 text-xl font-bold">✅</div>
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

          <div>
            <Label>Причина неисправности</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Например: Проблема с тормозами"
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
