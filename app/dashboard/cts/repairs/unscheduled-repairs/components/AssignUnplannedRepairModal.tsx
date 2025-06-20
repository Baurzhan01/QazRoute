// app/dashboard/unscheduled-repairs/components/AssignUnplannedRepairModal.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getAuthData } from "@/lib/auth-utils"
import { convoyService } from "@/service/convoyService"
import { releasePlanService } from "@/service/releasePlanService"
import { toast } from "@/components/ui/use-toast"

interface AssignUnplannedRepairModalProps {
  open: boolean
  onClose: () => void
  date: Date
}

export default function AssignUnplannedRepairModal({ open, onClose, date }: AssignUnplannedRepairModalProps) {
  const [convoyId, setConvoyId] = useState<string>("")
  const [convoys, setConvoys] = useState<{ id: string; number: number }[]>([])
  const [dispatchItems, setDispatchItems] = useState<any[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [reason, setReason] = useState<string>("")

  const auth = getAuthData()
  const depotId = auth?.busDepotId ?? ""
  const formattedDate = date.toISOString().split("T")[0]

  useEffect(() => {
    if (!open) return

    convoyService.getByDepotId(depotId).then(res => {
      if (res.isSuccess) setConvoys(res.value ?? [])
    })
  }, [open, depotId])

  useEffect(() => {
    if (!convoyId) return
    releasePlanService.getFullDispatchByDate(formattedDate, convoyId).then(res => {
      if (res.isSuccess && res.value) {
        const items = res.value.assignments || []
        setDispatchItems(items)
      }
    })
  }, [convoyId, formattedDate])

  const handleSave = () => {
    const selected = dispatchItems.find(i => i.id === selectedItemId)
    if (!selected) return toast({ title: "Не выбрана строка выхода", variant: "destructive" })
    if (!reason.trim()) return toast({ title: "Укажите причину неисправности", variant: "destructive" })

    const now = new Date()
    const repairRecord = {
      driverName: selected.driver?.fullName,
      garageNumber: selected.bus?.garageNumber,
      govNumber: selected.bus?.govNumber,
      description: reason,
      repairStartTime: now.toTimeString().slice(0, 5),
      repairEndTime: null,
      repairEndDate: null,
      exitTime: null,
      odometer: null,
      date: formattedDate,
    }

    console.log("Добавление непланового ремонта:", repairRecord)
    toast({ title: "Неплановый ремонт записан (мок)", description: reason })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Назначить неплановый ремонт</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Автоколонна</Label>
            <Select value={convoyId} onValueChange={setConvoyId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите автоколонну" />
              </SelectTrigger>
              <SelectContent>
                {convoys.map(c => (
                  <SelectItem key={c.id} value={c.id}>Колонна №{c.number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {dispatchItems.length > 0 && (
            <div>
              <Label>Выход автобуса</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите выход" />
                </SelectTrigger>
                <SelectContent>
                  {dispatchItems.map(i => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.driver?.fullName} — {i.bus?.garageNumber} / {i.bus?.govNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Причина неисправности</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Например: Проблема с тормозами" />
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
