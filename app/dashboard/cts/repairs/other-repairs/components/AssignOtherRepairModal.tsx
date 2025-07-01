"use client"

import { useEffect, useState, useMemo, useRef } from "react"
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
import { busService } from "@/service/busService"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import type { DisplayBus } from "@/types/bus.types"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

interface AssignOtherRepairModalProps {
  open: boolean
  onClose: () => void
  date: Date
  onSuccess?: () => void
}

export default function AssignOtherRepairModal({
  open,
  onClose,
  date,
  onSuccess,
}: AssignOtherRepairModalProps) {
  const [convoyId, setConvoyId] = useState("")
  const [convoys, setConvoys] = useState<{ id: string; number: number }[]>([])
  const [buses, setBuses] = useState<DisplayBus[]>([])
  const [selectedBusId, setSelectedBusId] = useState("")
  const [reason, setReason] = useState("")
  const [mileage, setMileage] = useState("")
  const [isMileageEdited, setIsMileageEdited] = useState(false)
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [existingRepairs, setExistingRepairs] = useState<RouteExitRepairDto[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

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
    setSelectedBusId("")
    setSearch("")
    setBuses([])
    setExistingRepairs([])
    convoyService.getByDepotId(depotId).then((res) => {
      if (res.isSuccess) setConvoys(res.value ?? [])
    })
    setTimeout(() => searchRef.current?.focus(), 100)
  }, [open, depotId])

  useEffect(() => {
    if (!convoyId) return

    setIsLoading(true)
    Promise.all([
      busService.getByConvoy(convoyId),
      routeExitRepairService.getByDate(formattedDate, depotId),
    ]).then(([busList, repairsRes]) => {
      setBuses(busList)
      if (repairsRes.isSuccess && repairsRes.value) {
        const others = repairsRes.value.filter(r => r.repairType === "Other")
        setExistingRepairs(others)
      }
      setIsLoading(false)
    })
  }, [convoyId, formattedDate])

  useEffect(() => {
    const fetchBusMileage = async () => {
      if (!selectedBusId || isMileageEdited) return
      const res = await busService.getById(selectedBusId)
      if (res.isSuccess) {
        const m = res.value?.mileage
        setMileage(m != null ? String(m) : "0")
      } else {
        setMileage("0")
      }
    }
    fetchBusMileage()
  }, [selectedBusId, isMileageEdited])

  const filteredBuses = useMemo(() => {
    const q = search.trim().toLowerCase()
    return !q
      ? buses
      : buses.filter(
          (b) =>
            b.govNumber?.toLowerCase().includes(q) ||
            b.garageNumber?.toLowerCase().includes(q)
        )
  }, [buses, search])

  const isDuplicate = useMemo(() => {
    return existingRepairs.some(r => r.bus?.id === selectedBusId)
  }, [existingRepairs, selectedBusId])

  const handleSave = async () => {
    if (!selectedBusId) return toast({ title: "Выберите автобус", variant: "destructive" })
    if (!reason.trim()) return toast({ title: "Укажите причину неисправности", variant: "destructive" })
    if (!mileage) return toast({ title: "Укажите пробег", variant: "destructive" })

    if (isDuplicate) {
      return toast({
        title: "Прочий ремонт уже создан",
        description: "Этот автобус уже записан на ремонт на выбранную дату",
        variant: "destructive",
      })
    }

    const result = await routeExitRepairService.create({
      startDate: formattedDate,
      startTime: currentTime,
      andDate: null,
      andTime: null,
      dispatchBusLineId: null,
      reserveId: null,
      isExist: true,
      text: reason,
      mileage: parseInt(mileage, 10),
      isLongRepair: false,
      repairType: "Other",
    })

    if (result.isSuccess) {
      toast({ title: "Прочий ремонт добавлен" })
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
          <DialogTitle>Добавить прочий ремонт</DialogTitle>
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

          {!isLoading && convoyId && (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label>Поиск автобуса</Label>
                  <Input
                    ref={searchRef}
                    placeholder="Гос. номер или гаражный номер"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {search && (
                  <Button variant="ghost" onClick={() => setSearch("")}>Очистить</Button>
                )}
              </div>

              <ScrollArea className="h-[300px] overflow-y-auto border rounded-md divide-y">
                {filteredBuses.map((bus, index) => (
                  <div
                    key={`${bus.id}-${index}`}
                    onClick={() => {
                      setSelectedBusId(bus.id)
                      setIsMileageEdited(false)
                    }}
                    className={cn(
                      "cursor-pointer px-4 py-3 flex justify-between items-center transition-colors duration-150",
                      selectedBusId === bus.id && "bg-muted border-l-4 border-primary"
                    )}
                  >
                    <div>
                      <p className="text-base font-medium">🚍 {bus.govNumber ?? "–"} ({bus.garageNumber ?? "–"})</p>
                    </div>
                    {selectedBusId === bus.id && (
                      <div className={cn("text-xl font-bold", isDuplicate ? "text-orange-500" : "text-green-600")}>
                        {isDuplicate ? "⚠ Уже добавлен" : "✅"}
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
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
          <Button
            onClick={handleSave}
            disabled={isDuplicate || !selectedBusId || !reason.trim() || !mileage}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
