"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"
import { routeExitRepairService } from "@/service/routeExitRepairService"

interface EditRepairModalProps {
  repair: RouteExitRepairDto
  onClose: () => void
  onSave?: () => void
}

export default function EditRepairModal({ repair, onClose, onSave }: EditRepairModalProps) {
  const [text, setText] = useState(repair.text || "")
  const [mileage, setMileage] = useState(repair.mileage ?? 0)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const result = await routeExitRepairService.update(repair.id, {
      ...repair,
      text,
      mileage,
    })
    setSaving(false)

    if (result.isSuccess) {
      toast({ title: "Успешно", description: "Запись обновлена" })
      onSave?.()
      onClose()
    } else {
      toast({ title: "Ошибка", description: result.error || "Не удалось сохранить", variant: "destructive" })
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать ремонт</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Описание / причина</label>
            <Input value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Пробег</label>
            <Input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
