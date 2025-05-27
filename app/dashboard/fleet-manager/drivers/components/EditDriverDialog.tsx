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

interface EditDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
  onSubmit: (id: string, driver: Omit<Driver, "id">) => Promise<boolean>
}

export default function EditDriverDialog({ open, onOpenChange, driver, onSubmit }: EditDriverDialogProps) {
  const [formData, setFormData] = useState<Partial<Driver>>({
    fullName: "",
    serviceNumber: "",
    phone: "",
    address: "",
    additionalInfo: "",
    driverStatus: "OnWork",
    busId: "",
    convoyId: "",
    iin: "",
  })
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Заполняем форму данными водителя при открытии диалога
  useEffect(() => {
    if (driver) {
      setFormData({
        fullName: driver.fullName,
        serviceNumber: driver.serviceNumber,
        phone: driver.phone,
        address: driver.address,
        additionalInfo: driver.additionalInfo,
        driverStatus: driver.driverStatus,
        busId: driver.busId,
        convoyId: driver.convoyId,
        iin: driver.iin ?? "",
      })

      // Устанавливаем дату рождения
      if (driver.birthDate) {
        if (typeof driver.birthDate === "string") {
          setBirthDate(new Date(driver.birthDate))
        } else {
          const { year, month, day } = driver.birthDate
          setBirthDate(new Date(year, month - 1, day))
        }
      }      
    }
  }, [driver])

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: Partial<Driver>) => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения выпадающих списков
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: Partial<Driver>) => ({ ...prev, [name]: value }))
  }

  // Обработчик отправки формы
  const handleSubmit = async () => {
    if (!driver || !formData.fullName || !formData.serviceNumber) {
      return
    }

    setIsSubmitting(true)

    // Подготовка данных для отправки
    const authData = localStorage.getItem("authData")
    const currentConvoyId =
      authData && JSON.parse(authData)?.convoyId

    const driverData: Omit<Driver, "id"> = {
      fullName: formData.fullName || "",
      serviceNumber: formData.serviceNumber || "",
      phone: formData.phone || "",
      address: formData.address || "",
      additionalInfo: formData.additionalInfo || "",
      driverStatus: formData.driverStatus || "OnWork",
      busId: formData.busId?.trim() ? formData.busId : null,         // ✅ fix 1
      convoyId: currentConvoyId || formData.convoyId || "1",         // ✅ fix 2
      iin: formData.iin ?? null,
      birthDate: birthDate
        ? birthDate.toISOString().split("T")[0]
        : driver?.birthDate ?? null,
      inReserve: driver?.inReserve ?? false,
    }

    const success = await onSubmit(driver.id as string, driverData)

    if (success) {
      onOpenChange(false)
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Редактировать водителя</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              ФИО *
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serviceNumber" className="text-right">
              Табельный номер *
            </Label>
            <Input
              id="serviceNumber"
              name="serviceNumber"
              value={formData.serviceNumber}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="iin" className="text-right">ИИН</Label>
            <Input
              id="iin"
              name="iin"
              value={formData.iin ?? ""}
              onChange={handleChange}
              className="col-span-3"
          />
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
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="col-span-3"
            />
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
                <SelectItem value="DayOff">Выходной</SelectItem>
                <SelectItem value="OnVacation">В отпуске</SelectItem>
                <SelectItem value="OnSickLeave">На больничном</SelectItem>
                <SelectItem value="Intern">Стажер</SelectItem>
                <SelectItem value="Fired">Отстранен</SelectItem>
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
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

