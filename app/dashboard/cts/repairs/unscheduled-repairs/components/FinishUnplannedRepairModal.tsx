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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { routeExitRepairService } from "@/service/routeExitRepairService"

interface FinishUnplannedRepairModalProps {
  open: boolean
  onClose: () => void
  repairId: string
  date: Date
  onSuccess?: () => void
}

export default function FinishUnplannedRepairModal({
  open,
  onClose,
  repairId,
  date,
  onSuccess
}: FinishUnplannedRepairModalProps) {
  const [mileage, setMileage] = useState<string>("")

  useEffect(() => {
    if (open) setMileage("")
  }, [open])

  const handleSubmit = async () => {
    if (!mileage) {
      toast({ title: "Укажите пробег", variant: "destructive" })
      return
    }

    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:00`

    const formattedDate = format(date, "yyyy-MM-dd")

    const result = await routeExitRepairService.finishRepair(repairId, {
      andDate: formattedDate,
      andTime: time,
      mileage: parseInt(mileage, 10),
      isExist: true,
    })

    if (result.isSuccess) {
      toast({ title: "Ремонт успешно завершён" })
      onClose()
      onSuccess?.()
    } else {
      toast({
        title: "Ошибка при завершении",
        description: result.error || "",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Завершить ремонт</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Label>Пробег (км)</Label>
          <Input
            type="number"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="напр. 123456"
          />
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
