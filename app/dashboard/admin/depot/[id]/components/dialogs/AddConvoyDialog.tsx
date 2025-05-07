"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ConvoyFormData, User } from "../../types";

interface AddConvoyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ConvoyFormData;
  users: User[];
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: keyof ConvoyFormData, value: string) => void;
  onSubmit: () => void;
}

export default function AddConvoyDialog({
  open,
  onOpenChange,
  formData,
  users,
  onFormChange,
  onSelectChange,
  onSubmit,
}: AddConvoyDialogProps) {

  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить автоколонну</DialogTitle>
          <DialogDescription>Заполните информацию о новой автоколонне</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="number" className="text-right">Номер</Label>
            <Input
              id="number"
              name="number"
              type="number"
              value={formData.number}
              onChange={onFormChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chiefId" className="text-right">Начальник</Label>
            <Select value={formData.chiefId || "not-assigned"} onValueChange={(value) => onSelectChange("chiefId", value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите начальника (необязательно)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-assigned">Не назначен</SelectItem>
                {safeUsers.filter(u => u.role === "fleetManager").map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mechanicId" className="text-right">Механик</Label>
            <Select value={formData.mechanicId || "not-assigned"} onValueChange={(value) => onSelectChange("mechanicId", value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите механика (необязательно)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-assigned">Не назначен</SelectItem>
                {safeUsers.filter(u => u.role === "mechanic").map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={onSubmit}>Добавить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
