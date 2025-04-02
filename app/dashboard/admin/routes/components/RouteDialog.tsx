"use client"

import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RouteFormData, Station } from "../types"

interface RouteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  formData: RouteFormData
  stations: Station[]
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSelectChange: (name: string, value: string) => void
  onSubmit: () => void
  submitLabel: string
}

export default function RouteDialog({
  open,
  onOpenChange,
  title,
  description,
  formData,
  stations,
  onFormChange,
  onSelectChange,
  onSubmit,
  submitLabel,
}: RouteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название маршрута</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={onFormChange}
              placeholder="Название маршрута"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exitNumbers">Номера выходов</Label>
            <Input
              id="exitNumbers"
              name="exitNumbers"
              value={formData.exitNumbers}
              onChange={onFormChange}
              placeholder="Номера выходов"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderInSchedule">Порядок в разнорядке</Label>
            <Input
              id="orderInSchedule"
              name="orderInSchedule"
              value={formData.orderInSchedule}
              onChange={onFormChange}
              placeholder="Порядок в разнорядке"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Дополнительная информация</Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={onFormChange}
              placeholder="Дополнительная информация"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="station">Станция</Label>
            <Select value={formData.station} onValueChange={(value) => onSelectChange("station", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите станцию" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

