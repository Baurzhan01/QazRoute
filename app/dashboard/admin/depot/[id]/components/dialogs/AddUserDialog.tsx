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

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: UserFormData
  convoys: Convoy[]
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectChange: (name: keyof UserFormData, value: string) => void
  onSubmit: () => void
}

export default function AddUserDialog({
  open,
  onOpenChange,
  formData,
  convoys,
  onFormChange,
  onSelectChange,
  onSubmit,
}: AddUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить пользователя</DialogTitle>
          <DialogDescription>Заполните информацию о новом пользователе</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              ФИО
            </Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={onFormChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onFormChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="login" className="text-right">
              Логин
            </Label>
            <Input id="login" name="login" value={formData.login} onChange={onFormChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Пароль
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={onFormChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Роль
            </Label>
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

          {formData.role === "fleetManager" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="convoyId" className="text-right">
                Автоколонна
              </Label>
              <Select value={formData.convoyId} onValueChange={(value) => onSelectChange("convoyId", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите автоколонну (необязательно)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="not-assigned" value="not-assigned">Не назначена</SelectItem>
                  {convoys.map((convoy) => (
                    <SelectItem key={convoy.id} value={convoy.id}>
                      Автоколонна №{convoy.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.role !== "fleetManager" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Должность
              </Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={onFormChange}
                className="col-span-3"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>Добавить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}