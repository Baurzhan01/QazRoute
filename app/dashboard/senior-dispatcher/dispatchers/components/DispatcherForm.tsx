"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Dispatcher, NewDispatcher } from "../types/dispatcher.types"
import { authService } from "@/service/authService"

interface DispatcherFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: NewDispatcher) => Promise<boolean>
  dispatcher?: Dispatcher
  convoys: { id: string; name: string; number: string }[]
  title: string
}

export function DispatcherForm({
  isOpen,
  onClose,
  onSubmit,
  dispatcher,
  convoys,
  title,
}: DispatcherFormProps) {
  const [formData, setFormData] = useState<NewDispatcher>({
    fullName: "",
    login: "",
    email: "",
    password: "",
    convoy: convoys[0] || { id: "", name: "", number: "" },
  })

  useEffect(() => {
    if (dispatcher) {
      setFormData({
        fullName: dispatcher.fullName,
        login: dispatcher.login,
        email: dispatcher.email,
        password: "",
        convoy: dispatcher.convoy,
      })
    } else {
      setFormData({
        fullName: "",
        login: "",
        email: "",
        password: "",
        convoy: convoys[0] || { id: "", name: "", number: "" },
      })
    }
  }, [dispatcher, convoys, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConvoyChange = (value: string) => {
    const selectedConvoy = convoys.find((c) => c.id === value) || convoys[0]
    setFormData((prev) => ({ ...prev, convoy: selectedConvoy }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Изменение пароля, если задано при редактировании
    if (dispatcher && formData.password) {
      await authService.changePassword(dispatcher.id, formData.password)
    }

    const success = await onSubmit({
      ...formData,
      password: dispatcher ? "" : formData.password,
    })

    if (success) onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">ФИО</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="ivanov"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ivanov@busfleet.kz"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">{dispatcher ? "Новый пароль" : "Пароль"}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                required={!dispatcher}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="convoy">Автоколонна</Label>
              <Select value={formData.convoy.id} onValueChange={handleConvoyChange}>
                <SelectTrigger id="convoy">
                  <SelectValue placeholder="Выберите автоколонну" />
                </SelectTrigger>
                <SelectContent>
                  {convoys.map((convoy) => (
                    <SelectItem key={convoy.id} value={convoy.id}>
                      {convoy.name} ({convoy.number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">{dispatcher ? "Сохранить" : "Добавить"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
