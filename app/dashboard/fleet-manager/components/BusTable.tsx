"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import type { Bus } from "@/app/api/types"
import { busService } from "@/app/api/apiService"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

export default function BusTable() {
  const [buses, setBuses] = useState<Bus[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [formData, setFormData] = useState<Partial<Bus>>({
    govNumber: "",
    garageNumber: "",
    additionalInfo: "",
    busStatus: "Operational",
    busLineId: "",
    convoyId: "",
  })

  // Загрузка данных об автобусах
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true)
        const response = await busService.getAll()
        if (response.isSuccess && response.value) {
          setBuses(response.value)
        } else {
          throw new Error(response.error || "Не удалось получить данные об автобусах")
        }
      } catch (err) {
        console.error("Ошибка при получении списка автобусов:", err)
        setError(err instanceof Error ? err : new Error("Неизвестная ошибка"))
      } finally {
        setLoading(false)
      }
    }

    fetchBuses()
  }, [])

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик добавления автобуса
  const handleAddBus = async () => {
    try {
      const response = await busService.create(formData as Omit<Bus, "id">)
      if (response.isSuccess) {
        toast({
          title: "Успешно",
          description: "Автобус успешно добавлен",
        })
        setIsAddDialogOpen(false)
        // Обновляем список автобусов
        const updatedBusesResponse = await busService.getAll()
        if (updatedBusesResponse.isSuccess && updatedBusesResponse.value) {
          setBuses(updatedBusesResponse.value)
        }
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось добавить автобус",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Ошибка при добавлении автобуса:", err)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при добавлении автобуса",
        variant: "destructive",
      })
    }
  }

  // Обработчик редактирования автобуса
  const handleEditBus = async () => {
    if (!selectedBus) return

    try {
      const response = await busService.update(selectedBus.id, formData as Omit<Bus, "id">)
      if (response.isSuccess) {
        toast({
          title: "Успешно",
          description: "Данные автобуса успешно обновлены",
        })
        setIsEditDialogOpen(false)
        // Обновляем список автобусов
        const updatedBusesResponse = await busService.getAll()
        if (updatedBusesResponse.isSuccess && updatedBusesResponse.value) {
          setBuses(updatedBusesResponse.value)
        }
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось обновить данные автобуса",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Ошибка при обновлении данных автобуса:", err)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении данных автобуса",
        variant: "destructive",
      })
    }
  }

  // Обработчик удаления автобуса
  const handleDeleteBus = async () => {
    if (!selectedBus) return

    try {
      const response = await busService.delete(selectedBus.id)
      if (response.isSuccess) {
        toast({
          title: "Успешно",
          description: "Автобус успешно удален",
        })
        setIsDeleteDialogOpen(false)
        // Обновляем список автобусов
        const updatedBusesResponse = await busService.getAll()
        if (updatedBusesResponse.isSuccess && updatedBusesResponse.value) {
          setBuses(updatedBusesResponse.value)
        }
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось удалить автобус",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Ошибка при удалении автобуса:", err)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении автобуса",
        variant: "destructive",
      })
    }
  }

  // Открытие диалога редактирования
  const openEditDialog = (bus: Bus) => {
    setSelectedBus(bus)
    setFormData({
      govNumber: bus.govNumber,
      garageNumber: bus.garageNumber,
      additionalInfo: bus.additionalInfo,
      busStatus: bus.busStatus,
      busLineId: bus.busLineId,
      convoyId: bus.convoyId,
    })
    setIsEditDialogOpen(true)
  }

  // Открытие диалога удаления
  const openDeleteDialog = (bus: Bus) => {
    setSelectedBus(bus)
    setIsDeleteDialogOpen(true)
  }

  // Перевод статуса автобуса на русский
  const translateBusStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      Operational: "Рабочий",
      Maintenance: "На ТО",
      OutOfService: "Не в эксплуатации",
      MaintenanceRequired: "Требуется ТО",
      MaintenanceScheduled: "Запланировано ТО",
      MaintenanceCompleted: "ТО завершено",
      MaintenanceOverdue: "Просрочено ТО",
    }
    return statusMap[status] || status
  }

  // Анимация для таблицы
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  if (loading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Автобусы</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Добавить автобус
          </Button>
        </div>
        <div className="space-y-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-md bg-gray-200"></div>
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Автобусы</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить автобус
          </Button>
        </div>
        <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
          Ошибка при загрузке данных: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Автобусы</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить автобус
        </Button>
      </div>

      <motion.div className="rounded-md border" variants={tableVariants} initial="hidden" animate="visible">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Гос. номер</TableHead>
              <TableHead>Гаражный номер</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дополнительная информация</TableHead>
              <TableHead className="w-[80px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buses && buses.length > 0 ? (
              buses.map((bus) => (
                <motion.tr key={bus.id} variants={rowVariants}>
                  <TableCell>{bus.govNumber}</TableCell>
                  <TableCell>{bus.garageNumber}</TableCell>
                  <TableCell>{translateBusStatus(bus.busStatus)}</TableCell>
                  <TableCell>{bus.additionalInfo}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(bus)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(bus)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Диалог добавления автобуса */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый автобус</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="govNumber" className="text-right">
                Гос. номер
              </Label>
              <Input
                id="govNumber"
                name="govNumber"
                value={formData.govNumber}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="garageNumber" className="text-right">
                Гаражный номер
              </Label>
              <Input
                id="garageNumber"
                name="garageNumber"
                value={formData.garageNumber}
                onChange={handleChange}
                className="col-span-3"
              />
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
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button onClick={handleAddBus}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования автобуса */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать автобус</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="govNumber" className="text-right">
                Гос. номер
              </Label>
              <Input
                id="govNumber"
                name="govNumber"
                value={formData.govNumber}
                onChange={handleChange}
                className="col-span-3"
              />
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
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button onClick={handleEditBus}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления автобуса */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить автобус</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить автобус {selectedBus?.garageNumber}?</p>
            <p className="text-sm text-gray-500 mt-2">Это действие нельзя отменить.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteBus}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

