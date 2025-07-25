"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { busService } from "@/service/busService"
import { releasePlanService } from "@/service/releasePlanService"
import type { DisplayBus } from "@/types/bus.types"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import type { BusStatus } from "@/types/bus.types"


interface Props {
  open: boolean
  onClose: () => void
  date: string
  convoyId: string
  dispatchBusLineId: string
  driverId: string
  isFirstShift: boolean
  onSuccess: () => void
}

const busStatusMap: Record<BusStatus, string> = {
  OnWork: "На линии",
  UnderRepair: "В ремонте",
  LongTermRepair: "Долгий ремонт",
  DayOff: "На выходном",
  Decommissioned: "Списан",
}

export default function BusSelectDialog({
  open,
  onClose,
  date,
  convoyId,
  dispatchBusLineId,
  driverId,
  isFirstShift,
  onSuccess,
}: Props) {
  const [buses, setBuses] = useState<DisplayBus[]>([])
  const [selected, setSelected] = useState<DisplayBus | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && convoyId && date) {
      busService
        .getFreeBuses(date, convoyId)
        .then(setBuses)
        .catch(() => {
          setBuses([])
        })
    }
  }, [open, date, convoyId])

  const handleSelect = (bus: DisplayBus) => {
    setSelected(bus)
  }

  const handleConfirm = async () => {
    if (!selected) return
    setLoading(true)

    try {
      const result = await releasePlanService.replaceAssignment(
        dispatchBusLineId,
        isFirstShift,
        "Permutation", // ✅ корректный тип замены
        driverId,
        selected.id
      )

      if (result?.isSuccess) {
        toast({ title: "✅ Автобус успешно заменён" })
        onSuccess()
      } else {
        toast({ title: "🚫 Ошибка замены автобуса", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "⚠️ Ошибка при замене", variant: "destructive" })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Выбор автобуса</DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto text-sm border rounded">
          <table className="w-full">
            <thead className="bg-blue-100 text-left">
              <tr>
                <th className="px-2 py-1">№</th>
                <th className="px-2 py-1">Гараж</th>
                <th className="px-2 py-1">Гос. номер</th>
                <th className="px-2 py-1">Статус</th>
                <th className="px-2 py-1">Выбор</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus, index) => {
                const isSelected = bus.id === selected?.id
                return (
                  <tr
                    key={bus.id}
                    onClick={() => handleSelect(bus)}
                    className={cn(
                      "cursor-pointer hover:bg-blue-50",
                      isSelected && "bg-green-100"
                    )}
                  >
                    <td className="px-2 py-1">{index + 1}</td>
                    <td className="px-2 py-1">{bus.garageNumber ?? "—"}</td>
                    <td className="px-2 py-1">{bus.govNumber ?? "—"}</td>
                    <td className="px-2 py-1">
                      {bus.status ? busStatusMap[bus.status as keyof typeof busStatusMap] : "—"}
                    </td>
                    <td className="px-2 py-1">
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    </td>
                  </tr>
                )
              })}
              {buses.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-4">
                    🚫 Нет доступных автобусов
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={!selected || loading}>
            {loading ? "Загрузка..." : "Выбрать"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
