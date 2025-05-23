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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Convoy, UserFormData } from "../../types"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: UserFormData
  convoys: Convoy[]
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectChange: (name: keyof UserFormData, value: string | undefined) => void
  onSubmit: () => void
}

export default function EditUserDialog({
  open,
  onOpenChange,
  formData,
  convoys,
  onFormChange,
  onSelectChange,
  onSubmit,
}: EditUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
          <DialogDescription>Измените информацию о пользователе</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">ФИО</Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={onFormChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={onFormChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Роль</Label>
            <Select value={formData.role} onValueChange={(value) => onSelectChange("role", value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fleetManager">Начальник колонны</SelectItem>
                <SelectItem value="seniorDispatcher">Старший диспетчер</SelectItem>
                <SelectItem value="dispatcher">Диспетчер</SelectItem>
                <SelectItem value="mechanic">Механик</SelectItem>
                <SelectItem value="hr">Отдел кадров</SelectItem>
                <SelectItem value="taskInspector">Отдел таксировки</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.role === "fleetManager" || formData.role === "mechanic") && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="convoyId" className="text-right">Автоколонна</Label>
              <Select value={formData.convoyId ?? "not-assigned"} onValueChange={(value) => onSelectChange("convoyId", value === "not-assigned" ? undefined : value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите автоколонну (необязательно)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-assigned">Не назначена</SelectItem>
                  {convoys.map((convoy) => (
                    <SelectItem key={convoy.id} value={convoy.id}>
                      Автоколонна №{convoy.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.role !== "fleetManager" && formData.role !== "mechanic" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">Должность</Label>
              <Input id="position" name="position" value={formData.position} onChange={onFormChange} className="col-span-3" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={onSubmit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
