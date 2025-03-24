"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { ArrowLeft, Edit, MoreHorizontal, Plus, Search, Trash2, Users } from "lucide-react"
import Link from "next/link"
import { driverService } from "@/app/api/apiService"
import type { Driver } from "@/app/api/types"

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [formData, setFormData] = useState<Partial<Driver>>({
    fullName: "",
    serviceNumber: "",
    phone: "",
    address: "",
    additionalInfo: "",
    driverStatus: "Active",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true)
        const response = await driverService.getAll()

        if (response.isSuccess && response.value) {
          setDrivers(response.value)
        } else {
          throw new Error(response.error || "Не удалось получить данные о водителях")
        }
      } catch (err) {
        console.error("Ошибка при получении списка водителей:", err)
        setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке данных")
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения выпадающих списков
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик добавления водителя
  const handleAddDriver = async () => {
    try {
      if (!formData.fullName || !formData.serviceNumber) {
        toast({
          title: "Ошибка",
          description: "Заполните обязательные поля",
          variant: "destructive",
        })
        return
      }

      // В реальном приложении здесь должен быть API запрос
      // driverService.create(formData as Omit<Driver, "id">)

      // Имитация добавления
      const newDriver: Driver = {
        id: Math.random().toString(36).substring(2, 9),
        fullName: formData.fullName || "",
        serviceNumber: formData.serviceNumber || "",
        phone: formData.phone || "",
        address: formData.address || "",
        additionalInfo: formData.additionalInfo || "",
        driverStatus: formData.driverStatus || "Active",
        busId: "",
        birthDate: {
          year: 1990,
          month: 1,
          day: 1,
          dayOfWeek: 1,
        },
      }

      setDrivers((prev) => [...prev, newDriver])
      setIsAddDialogOpen(false)
      setFormData({
        fullName: "",
        serviceNumber: "",
        phone: "",
        address: "",
        additionalInfo: "",
        driverStatus: "Active",
      })

      toast({
        title: "Успешно",
        description: "Водитель успешно добавлен",
      })
    } catch (err) {
      console.error("Ошибка при добавлении водителя:", err)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при добавлении водителя",
        variant: "destructive",
      })
    }
  }

  // Обработчик редактирования водителя
  const handleEditDriver = async () => {
    try {
      if (!selectedDriver || !formData.fullName || !formData.serviceNumber) {
        toast({
          title: "Ошибка",
          description: "Заполните обязательные поля",
          variant: "destructive",
        })
        return
      }

      // В реальном приложении здесь должен быть API запрос
      // driverService.update(selectedDriver.id, formData as Omit<Driver, "id">)

      // Имитация обновления
      setDrivers((prev) =>
        prev.map((driver) => (driver.id === selectedDriver.id ? { ...driver, ...formData } : driver)),
      )

      setIsEditDialogOpen(false)

      toast({
        title: "Успешно",
        description: "Данные водителя успешно обновлены",
      })
    } catch (err) {
      console.error("Ошибка при редактировании водителя:", err)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении данных водителя",
        variant: "destructive",
      })
    }
  }

  // Обработчик удаления водителя
  const handleDeleteDriver = async () => {
    try {
      if (!selectedDriver) return

      // В реальном приложении здесь должен быть API запрос
      // driverService.delete(selectedDriver.id)

      // Имитация удаления
      setDrivers((prev) => prev.filter((driver) => driver.id !== selectedDriver.id))
      setIsDeleteDialogOpen(false)

      toast({
        title: "Успешно",
        description: "Водитель успешно удален",
      })
    } catch (err) {
      console.error("Ошибка при удалении водителя:", err)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении водителя",
        variant: "destructive",
      })
    }
  }

  // Открытие диалога редактирования
  const openEditDialog = (driver: Driver) => {
    setSelectedDriver(driver)
    setFormData({
      fullName: driver.fullName,
      serviceNumber: driver.serviceNumber,
      phone: driver.phone,
      address: driver.address,
      additionalInfo: driver.additionalInfo,
      driverStatus: driver.driverStatus,
    })
    setIsEditDialogOpen(true)
  }

  // Открытие диалога удаления
  const openDeleteDialog = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsDeleteDialogOpen(true)
  }

  // Фильтрация водителей по поисковому запросу
  const filteredDrivers = searchQuery
    ? drivers.filter(
        (driver) =>
          driver.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.serviceNumber.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : drivers

  // Перевод статуса водителя на русский
  const translateDriverStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      Active: "Активен",
      OnVacation: "В отпуске",
      Sick: "Болен",
      Training: "На обучении",
      Suspended: "Отстранен",
      Fired: "Уволен",
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="space-y-4 mt-6">
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/fleet-manager">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-amber-500">Управление водителями</h1>
          <p className="text-gray-500 mt-1">Информация о водителях, графики работы и статусы</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Поиск по имени или номеру..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить водителя
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Список водителей
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>
            ) : filteredDrivers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchQuery ? "Водители не найдены" : "Нет доступных водителей"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? `По запросу "${searchQuery}" ничего не найдено`
                    : "В системе нет зарегистрированных водителей"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить водителя
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ФИО</TableHead>
                      <TableHead>Табельный номер</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="w-[80px]">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.map((driver) => (
                      <TableRow key={driver.id} className="group">
                        <TableCell className="font-medium">{driver.fullName}</TableCell>
                        <TableCell>{driver.serviceNumber}</TableCell>
                        <TableCell>{driver.phone}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              driver.driverStatus === "Active"
                                ? "bg-green-100 text-green-800"
                                : driver.driverStatus === "Sick" || driver.driverStatus === "Suspended"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {translateDriverStatus(driver.driverStatus)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(driver)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(driver)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Диалог добавления водителя */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Добавить нового водителя</DialogTitle>
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
              <Select
                value={formData.driverStatus}
                onValueChange={(value) => handleSelectChange("driverStatus", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите статус водителя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Активен</SelectItem>
                  <SelectItem value="OnVacation">В отпуске</SelectItem>
                  <SelectItem value="Sick">Болен</SelectItem>
                  <SelectItem value="Training">На обучении</SelectItem>
                  <SelectItem value="Suspended">Отстранен</SelectItem>
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
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddDriver}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования водителя */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
              <Label htmlFor="phone" className="text-right">
                Телефон
              </Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driverStatus" className="text-right">
                Статус
              </Label>
              <Select
                value={formData.driverStatus}
                onValueChange={(value) => handleSelectChange("driverStatus", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите статус водителя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Активен</SelectItem>
                  <SelectItem value="OnVacation">В отпуске</SelectItem>
                  <SelectItem value="Sick">Болен</SelectItem>
                  <SelectItem value="Training">На обучении</SelectItem>
                  <SelectItem value="Suspended">Отстранен</SelectItem>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditDriver}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления водителя */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить водителя</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить водителя «{selectedDriver?.fullName}»?</p>
            <p className="text-sm text-gray-500 mt-2">Это действие нельзя отменить.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteDriver}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

