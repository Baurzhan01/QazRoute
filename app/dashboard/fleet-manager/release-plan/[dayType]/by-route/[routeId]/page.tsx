"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { ArrowLeft, Bus, Plus, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { routeService, busService, driverService } from "@/app/api/apiService"
import type { Route, Bus as BusType, Driver } from "@/app/api/types"

export default function RouteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.routeId as string
  const dayType = params.dayType as string

  const [route, setRoute] = useState<Route | null>(null)
  const [availableBuses, setAvailableBuses] = useState<BusType[]>([])
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
  const [assignedBuses, setAssignedBuses] = useState<{ bus: BusType; driver: Driver | null }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    busId: "",
    driverId: "",
  })

  // Получаем заголовок и описание в зависимости от типа дня
  const getDayTypeInfo = () => {
    switch (dayType) {
      case "workdays":
        return {
          title: "План выпуска (Будни)",
          color: "text-sky-700",
        }
      case "saturday":
        return {
          title: "План выпуска (Суббота)",
          color: "text-amber-600",
        }
      case "sunday":
        return {
          title: "План выпуска (Воскресенье)",
          color: "text-green-600",
        }
      default:
        return {
          title: "План выпуска",
          color: "text-sky-700",
        }
    }
  }

  const dayTypeInfo = getDayTypeInfo()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Загрузка данных о маршруте
        const routeResponse = await routeService.getById(routeId)
        if (!routeResponse.isSuccess || !routeResponse.value) {
          throw new Error(routeResponse.error || "Не удалось получить данные о маршруте")
        }

        setRoute(routeResponse.value)

        // Загрузка доступных автобусов
        const busesResponse = await busService.getAll()
        if (busesResponse.isSuccess && busesResponse.value) {
          // Фильтруем автобусы в статусе "Operational" (рабочие)
          const operationalBuses = busesResponse.value.filter((bus) => bus.busStatus === "Operational")
          setAvailableBuses(operationalBuses)

          // Для примера создаем несколько назначенных автобусов
          // В реальном приложении это должно приходить из API
          const mockAssigned = operationalBuses.slice(0, 3).map((bus) => ({
            bus,
            driver: null,
          }))
          setAssignedBuses(mockAssigned)
        }

        // Загрузка доступных водителей
        const driversResponse = await driverService.getAll()
        if (driversResponse.isSuccess && driversResponse.value) {
          setAvailableDrivers(driversResponse.value)

          // Обновляем назначенные автобусы с водителями
          if (driversResponse.value.length > 0 && busesResponse.isSuccess && busesResponse.value) {
            const operationalBuses = busesResponse.value.filter((bus) => bus.busStatus === "Operational").slice(0, 3)

            const assignedWithDrivers = operationalBuses.map((bus, index) => ({
              bus,
              driver: index < driversResponse.value.length ? driversResponse.value[index] : null,
            }))

            setAssignedBuses(assignedWithDrivers)
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err)
        setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке данных")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [routeId])

  // Обработчик добавления автобуса на маршрут
  const handleAddBusToRoute = () => {
    // Проверяем, выбран ли автобус
    if (!formData.busId) {
      toast({
        title: "Ошибка",
        description: "Выберите автобус для добавления на маршрут",
        variant: "destructive",
      })
      return
    }

    // Находим выбранный автобус
    const selectedBus = availableBuses.find((bus) => bus.id === formData.busId)
    if (!selectedBus) return

    // Находим выбранного водителя (если есть)
    const selectedDriver = formData.driverId ? availableDrivers.find((driver) => driver.id === formData.driverId) : null

    // Добавляем автобус в список назначенных
    setAssignedBuses((prev) => [
      ...prev,
      {
        bus: selectedBus,
        driver: selectedDriver || null,
      },
    ])

    // Удаляем автобус из списка доступных
    setAvailableBuses((prev) => prev.filter((bus) => bus.id !== formData.busId))

    // Если выбран водитель, удаляем его из списка доступных
    if (selectedDriver) {
      setAvailableDrivers((prev) => prev.filter((driver) => driver.id !== formData.driverId))
    }

    // Сбрасываем форму
    setFormData({ busId: "", driverId: "" })

    // Закрываем диалог
    setIsDialogOpen(false)

    // Показываем уведомление об успехе
    toast({
      title: "Успешно",
      description: "Автобус добавлен на маршрут",
    })
  }

  // Обработчик удаления автобуса с маршрута
  const handleRemoveBusFromRoute = (index: number) => {
    const removed = assignedBuses[index]

    // Возвращаем автобус в список доступных
    if (removed.bus) {
      setAvailableBuses((prev) => [...prev, removed.bus])
    }

    // Возвращаем водителя в список доступных
    if (removed.driver) {
      setAvailableDrivers((prev) => [...prev, removed.driver])
    }

    // Удаляем из списка назначенных
    setAssignedBuses((prev) => prev.filter((_, i) => i !== index))

    // Показываем уведомление об успехе
    toast({
      title: "Успешно",
      description: "Автобус удален с маршрута",
    })
  }

  // Обработчик сохранения плана выпуска
  const handleSavePlan = () => {
    // Здесь должен быть API запрос для сохранения плана
    // В данном примере просто показываем уведомление
    toast({
      title: "План сохранен",
      description: `Сохранен план выпуска для маршрута №${route?.number}`,
    })

    // Возвращаемся на страницу со всеми маршрутами
    router.push(`/dashboard/fleet-manager/release-plan/${dayType}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-60 bg-gray-200 animate-pulse rounded-lg mt-4"></div>
      </div>
    )
  }

  if (error || !route) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <Link href={`/dashboard/fleet-manager/release-plan/${dayType}`}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к маршрутам
          </Button>
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || "Маршрут не найден"}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/fleet-manager/release-plan/${dayType}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${dayTypeInfo.color}`}>
            {dayTypeInfo.title}: Маршрут №{route.number}
          </h1>
          <p className="text-gray-500 mt-1">Управление выпуском автобусов на маршрут</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-sky-500" />
              План выпуска автобусов
            </CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить автобус
            </Button>
          </CardHeader>
          <CardContent>
            {assignedBuses.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Bus className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Нет автобусов на маршруте</h3>
                <p className="text-gray-500 mb-4">Добавьте автобусы для выпуска на маршрут</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить автобус
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№</TableHead>
                    <TableHead>Гос. номер</TableHead>
                    <TableHead>Гаражный номер</TableHead>
                    <TableHead>Водитель</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedBuses.map((item, index) => (
                    <TableRow key={`${item.bus.id}-${index}`}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{item.bus.govNumber}</TableCell>
                      <TableCell>{item.bus.garageNumber}</TableCell>
                      <TableCell>{item.driver ? item.driver.fullName : "Не назначен"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveBusFromRoute(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="flex justify-end mt-6 space-x-2">
              <Link href={`/dashboard/fleet-manager/release-plan/${dayType}`}>
                <Button variant="outline">Отмена</Button>
              </Link>
              <Button onClick={handleSavePlan} disabled={assignedBuses.length === 0}>
                <Save className="mr-2 h-4 w-4" />
                Сохранить план
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Диалог добавления автобуса */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить автобус на маршрут</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="busId">Автобус</Label>
              <Select
                value={formData.busId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, busId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите автобус" />
                </SelectTrigger>
                <SelectContent>
                  {availableBuses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.garageNumber} ({bus.govNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverId">Водитель (необязательно)</Label>
              <Select
                value={formData.driverId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, driverId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите водителя" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id || ""}>
                      {driver.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddBusToRoute} disabled={!formData.busId}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

