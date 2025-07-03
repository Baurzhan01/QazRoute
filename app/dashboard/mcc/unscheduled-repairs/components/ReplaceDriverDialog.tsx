"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { driverService } from "@/service/driverService"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { getAuthData } from "@/lib/auth-utils"
import type { Driver } from "@/types/driver.types"

interface ReplaceDriverDialogProps {
  open: boolean
  onClose: () => void
  dispatchBusLineId: string
  onSuccess?: () => void
  onDriverReplaced?: (driverId: string, fullName: string) => void
}

export default function ReplaceDriverDialog({
  open,
  onClose,
  dispatchBusLineId,
  onSuccess,
  onDriverReplaced,
}: ReplaceDriverDialogProps) {
  const [search, setSearch] = useState("")
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)

  const depotId = getAuthData()?.busDepotId

  useEffect(() => {
    if (!open) return
    setSearch("")
    setDrivers([])
    setSelectedDriverId(null)
  }, [open])

  useEffect(() => {
    const fetch = async () => {
      if (!search.trim() || !depotId) return
      setLoading(true)
      const res = await driverService.searchDrivers(depotId, search)
      setDrivers(res.isSuccess && res.value ? res.value : [])
      setLoading(false)
    }

    const timeout = setTimeout(fetch, 300)
    return () => clearTimeout(timeout)
  }, [search, depotId])

  const handleConfirm = async () => {
    if (!selectedDriverId) {
      toast({ title: "Выберите водителя", variant: "destructive" })
      return
    }

    try {
      const res = await routeExitRepairService.replaceDriver(selectedDriverId, dispatchBusLineId)

      if (res.isSuccess) {
        const selectedDriver = drivers.find((d) => d.id === selectedDriverId)
        toast({ title: "Водитель успешно заменён" })

        onDriverReplaced?.(selectedDriverId, selectedDriver?.fullName ?? "")
        onSuccess?.()
        onClose()
      } else {
        toast({
          title: "Ошибка при замене водителя",
          description: res.error || "Не удалось заменить",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Ошибка при замене водителя",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Замена водителя</DialogTitle>
        </DialogHeader>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по ФИО или табельному номеру"
        />

        <ScrollArea className="h-64 mt-2 border rounded">
          {loading && <p className="p-4 text-sm text-muted-foreground">Загрузка...</p>}

          {!loading && drivers.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Нет результатов</p>
          )}

          {!loading &&
            drivers.map((d) => (
              <div
                key={d.id}
                onClick={() => d.id && setSelectedDriverId(d.id)}
                className={`px-4 py-2 cursor-pointer border-b hover:bg-sky-100 ${
                  selectedDriverId === d.id ? "bg-sky-200 font-semibold" : ""
                }`}
              >
                <p className="font-medium">{d.fullName}</p>
                <p className="text-xs text-muted-foreground">Табельный номер: {d.serviceNumber}</p>
              </div>
            ))}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedDriverId}>
            Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
