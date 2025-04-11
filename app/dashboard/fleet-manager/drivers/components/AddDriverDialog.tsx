"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Driver } from "@/types/driver.types"
import { StyledDatePicker } from "@/components/ui/StyledDatePicker"

interface AddDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (driver: Omit<Driver, "id">) => Promise<boolean>
}

export default function AddDriverDialog({ open, onOpenChange, onSubmit }: AddDriverDialogProps) {
  const [formData, setFormData] = useState<Partial<Driver>>({
    fullName: "",
    serviceNumber: "",
    phone: "",
    address: "",
    additionalInfo: "",
    driverStatus: "OnWork",
    busId: "",
    convoyId: "", // установим из localStorage
  })

  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Устанавливаем convoyId из localStorage
  useEffect(() => {
    if (!open) return
  
    const userData = localStorage.getItem("authData")
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setFormData((prev) => ({
          ...prev,
          convoyId: parsed?.convoyId || "",
          busId: null, 
        }))
      } catch (err) {
        console.warn("Ошибка парсинга localStorage authData:", err)
      }
    }
  }, [open])
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.serviceNumber) return

    setIsSubmitting(true)

    const driverData: Omit<Driver, "id"> = {
      fullName: formData.fullName || "",
      serviceNumber: formData.serviceNumber || "",
      phone: formData.phone || "",
      address: formData.address || "",
      additionalInfo: formData.additionalInfo || "",
      driverStatus: formData.driverStatus || "OnWork",
      busId: null,
      convoyId: formData.convoyId || "",
      birthDate: birthDate ? format(birthDate, "yyyy-MM-dd") : "1990-01-01"
    }

    const success = await onSubmit(driverData)

    if (success) {
      setFormData({
        fullName: "",
        serviceNumber: "",
        phone: "",
        address: "",
        additionalInfo: "",
        driverStatus: "OnWork",
        busId: "",
        convoyId: formData.convoyId || "",
      })
      setBirthDate(undefined)
      onOpenChange(false)
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Добавить нового водителя</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              ФИО *
            </Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serviceNumber" className="text-right">
              Табельный номер *
            </Label>
            <Input id="serviceNumber" name="serviceNumber" value={formData.serviceNumber} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthDate" className="text-right">
              Дата рождения
            </Label>
            <div className="col-span-3">
            <StyledDatePicker selected={birthDate ?? null} onChange={(date) => setBirthDate(date ?? undefined)} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Телефон
            </Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Адрес
            </Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driverStatus" className="text-right">
              Статус
            </Label>
            <Select value={formData.driverStatus} onValueChange={(value) => handleSelectChange("driverStatus", value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите статус водителя" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OnWork">На работе</SelectItem>
                <SelectItem value="OnVacation">В отпуске</SelectItem>
                <SelectItem value="OnSickLeave">На больничном</SelectItem>
                <SelectItem value="Intern">Стажировка</SelectItem>
                <SelectItem value="Fired">Уволен</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="additionalInfo" className="text-right">
              Доп. информация
            </Label>
            <Input
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.fullName || !formData.serviceNumber}>
            {isSubmitting ? "Добавление..." : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
