"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StyledDatePicker } from "@/components/ui/StyledDatePicker"
import { AlertDialog, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger } from "@/components/ui/alert-dialog"

import type { Driver } from "@/types/driver.types"
import { convoyService } from "@/service/convoyService"
import { driverService } from "@/service/driverService"
import type { Convoy } from "@/types/convoy.types"

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

  // ----- Новое: состояние для переноса в колонну -----
  const [convoys, setConvoys] = useState<Convoy[]>([])
  const [targetConvoyId, setTargetConvoyId] = useState<string>("")
  const [isLoadingConvoys, setIsLoadingConvoys] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  // Заполняем форму данными водителя при открытии
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

  // Загружаем список автоколонн при открытии диалога
  useEffect(() => {
    const loadConvoys = async () => {
      if (!open) return
      try {
        setIsLoadingConvoys(true)
        // Если нужно по депо: прочитать depotId из authData и вызвать getByDepotId
        // const depotId = JSON.parse(localStorage.getItem("authData") || "{}")?.busDepotId
        // const res = depotId ? await convoyService.getByDepotId(depotId) : await convoyService.getAll()
        const res = await convoyService.getAll()
        setConvoys(res.value || [])
      } catch (e) {
        // можно показать тост
        setConvoys([])
      } finally {
        setIsLoadingConvoys(false)
      }
    }
    loadConvoys()
  }, [open])

  // Обработчики формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: Partial<Driver>) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: Partial<Driver>) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!driver || !formData.fullName || !formData.serviceNumber) return

    setIsSubmitting(true)

    const authData = localStorage.getItem("authData")
    const currentConvoyId = authData && JSON.parse(authData)?.convoyId

    const driverData: Omit<Driver, "id"> = {
      fullName: formData.fullName || "",
      serviceNumber: formData.serviceNumber || "",
      phone: formData.phone || "",
      address: formData.address || "",
      additionalInfo: formData.additionalInfo || "",
      driverStatus: formData.driverStatus || "OnWork",
      busId: formData.busId?.trim() ? (formData.busId as string) : null,
      convoyId: currentConvoyId || (formData.convoyId as string) || "1",
      iin: formData.iin ?? null,
      birthDate: birthDate ? birthDate.toISOString().split("T")[0] : (driver?.birthDate as any) ?? null,
      inReserve: driver?.inReserve ?? false,
    }

    const success = await onSubmit(driver.id as string, driverData)
    if (success) onOpenChange(false)
    setIsSubmitting(false)
  }

  // ----- Новое: перенос водителя -----
  const handleMoveConfirm = async () => {
    if (!driver || !targetConvoyId || targetConvoyId === driver.convoyId) return
    setIsMoving(true)
    try {
      await driverService.replaceConvoy(driver.id as string, targetConvoyId)
      // Обновим локально колонну у формы, чтобы сразу видеть актуальные данные
      setFormData((p) => ({ ...p, convoyId: targetConvoyId }))
      // при желании — закрыть весь диалог:
      // onOpenChange(false)
    } finally {
      setIsMoving(false)
    }
  }

  const currentConvoy = convoys.find((c) => c.id === (driver?.convoyId || formData.convoyId))
  const targetConvoy = convoys.find((c) => c.id === targetConvoyId)
  const convoyLabel = (c?: Convoy) =>
    c ? `Колонна ${c.number ?? c.id}` : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Редактировать водителя</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Основные поля */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">ФИО *</Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serviceNumber" className="text-right">Табельный номер *</Label>
            <Input id="serviceNumber" name="serviceNumber" value={formData.serviceNumber} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="iin" className="text-right">ИИН</Label>
            <Input id="iin" name="iin" value={formData.iin ?? ""} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthDate" className="text-right">Дата рождения</Label>
            <div className="col-span-3">
              <StyledDatePicker selected={birthDate ?? null} onChange={(date) => setBirthDate(date ?? undefined)} />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Телефон</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">Адрес</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driverStatus" className="text-right">Статус</Label>
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
            <Label htmlFor="additionalInfo" className="text-right">Доп. информация</Label>
            <Input id="additionalInfo" name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} className="col-span-3" />
          </div>

          {/* ----- Новый блок: Переместить в автоколонну ----- */}
          <div className="mt-2 rounded-lg border p-4 bg-muted/30">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Текущая колонна</Label>
              <div className="col-span-3 text-sm text-muted-foreground">
                {convoyLabel(currentConvoy)}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4 mt-3">
              <Label className="text-right">Переместить в</Label>
              <Select
                value={targetConvoyId}
                onValueChange={(v) => setTargetConvoyId(v)}
                disabled={isLoadingConvoys}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={isLoadingConvoys ? "Загрузка..." : "Выберите автоколонну"} />
                </SelectTrigger>
                <SelectContent>
                  {convoys.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {convoyLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-3 flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    disabled={
                      isLoadingConvoys ||
                      isMoving ||
                      !targetConvoyId ||
                      targetConvoyId === (driver?.convoyId || formData.convoyId)
                    }
                  >
                    Переместить в автоколонну
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Подтвердите перенос</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы действительно хотите переместить водителя
                      <b> {driver?.fullName}</b> в <b>{convoyLabel(targetConvoy)}</b>?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isMoving}>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleMoveConfirm} disabled={isMoving}>
                      {isMoving ? "Перемещение..." : "Подтвердить"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          {/* ----- конец нового блока ----- */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isMoving}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.fullName || !formData.serviceNumber || isMoving}>
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
