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
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { ArrowLeft, Edit, MoreHorizontal, Plus, RouteIcon, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { routeService } from "@/app/api/apiService"
import type { Route } from "@/app/api/types"

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [formData, setFormData] = useState<Partial<Route>>({
    number: "",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true)
        const response = await routeService.getAll()

        if (response.isSuccess && response.value) {
          setRoutes(response.value)
        } else {
          throw new Error(response.error || "Не удалось получить данные о маршрутах")
        }
      } catch (err) {
        console.error("Ошибка при получении списка маршрутов:", err)
        setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке данных")
      } finally {
        setLoading(false)
      }
    }

    fetchRoutes()
  }, [])

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик добавления маршрута
  const handleAddRoute = async () => {
    try {
      if (!formData.number) {
        toast({
          title: "Ошибка",
          description: "Заполните номер маршрута",
          variant: "destructive",
        })
        return
      }

      // В реальном приложении здесь должен быть API запрос
      // routeService.create(formData as Omit<Route, "id">)

      // Имитация добавления
      const newRoute: Route = {
        id: Math.random().toString(36).substring(2, 9),
        number: formData.number,
      }

      setRoutes((prev) => [...prev, newRoute])
      setIsAddDialogOpen(false)
      setFormData({ number: "" })

      toast({
        title: "Успешно",
        description: "Маршрут успешно добавлен",
      })
    } catch (err) {
      console.error("Ошибка при добавлении маршрута:", err)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при добавлении маршрута",
        variant: "destructive",
      })
    }
  }

  // Обработчик редактирования маршрута
  const handleEditRoute = async () => {
    try {
      if (!selectedRoute || !formData.number) {
        toast({
          title: "Ошибка",
          description: "Заполните номер маршрута",
          variant: "destructive",
        })
        return
      }

      // В реальном приложении здесь должен быть API запрос
      // routeService.update(selectedRoute.id, formData as Omit<Route, "id">)

      // Имитация обновления
      setRoutes((prev) => prev.map((route) => (route.id === selectedRoute.id ? { ...route, ...formData } : route)))

      setIsEditDialogOpen(false)

      toast({
        title: "Успешно",
        description: "Маршрут успешно обновлен",
      })
    } catch (err) {
      console.error("Ошибка при редактировании маршрута:", err)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении маршрута",
        variant: "destructive",
      })
    }
  }

  // Обработчик удаления маршрута
  const handleDeleteRoute = async () => {
    try {
      if (!selectedRoute) return

      // В реальном приложении здесь должен быть API запрос
      // routeService.delete(selectedRoute.id)

      // Имитация удаления
      setRoutes((prev) => prev.filter((route) => route.id !== selectedRoute.id))
      setIsDeleteDialogOpen(false)

      toast({
        title: "Успешно",
        description: "Маршрут успешно удален",
      })
    } catch (err) {
      console.error("Ошибка при удалении маршрута:", err)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении маршрута",
        variant: "destructive",
      })
    }
  }

  // Открытие диалога редактирования
  const openEditDialog = (route: Route) => {
    setSelectedRoute(route)
    setFormData({
      number: route.number,
    })
    setIsEditDialogOpen(true)
  }

  // Открытие диалога удаления
  const openDeleteDialog = (route: Route) => {
    setSelectedRoute(route)
    setIsDeleteDialogOpen(true)
  }

  // Фильтрация маршрутов по поисковому запросу
  const filteredRoutes = searchQuery
    ? routes.filter((route) => route.number.toLowerCase().includes(searchQuery.toLowerCase()))
    : routes

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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700">Управление маршрутами</h1>
          <p className="text-gray-500 mt-1">Просмотр и редактирование маршрутов движения</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Поиск по номеру маршрута..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить маршрут
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RouteIcon className="h-5 w-5 text-purple-500" />
              Список маршрутов
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>
            ) : filteredRoutes.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <RouteIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchQuery ? "Маршруты не найдены" : "Нет доступных маршрутов"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? `По запросу "${searchQuery}" ничего не найдено`
                    : "В системе нет зарегистрированных маршрутов"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить маршрут
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Номер маршрута</TableHead>
                      <TableHead className="w-[80px]">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoutes.map((route) => (
                      <TableRow key={route.id} className="group">
                        <TableCell className="font-medium">№{route.number}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(route)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(route)}>
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

      {/* Диалог добавления маршрута */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый маршрут</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="number" className="text-right">
                Номер маршрута *
              </Label>
              <Input id="number" name="number" value={formData.number} onChange={handleChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddRoute}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования маршрута */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать маршрут</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="number" className="text-right">
                Номер маршрута *
              </Label>
              <Input id="number" name="number" value={formData.number} onChange={handleChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditRoute}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления маршрута */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить маршрут</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить маршрут №{selectedRoute?.number}?</p>
            <p className="text-sm text-gray-500 mt-2">Это действие нельзя отменить.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoute}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

