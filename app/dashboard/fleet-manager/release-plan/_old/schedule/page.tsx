"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { ArrowLeft, Bus, Calendar, Check, Clock, Download, FileText, Send } from "lucide-react"
import Link from "next/link"
import { routeService, busService, driverService } from "@/app/api/apiService"
import type { Route, Bus as BusType, Driver } from "@/app/api/types"

export default function SchedulePage() {
  const [loading, setLoading] = useState(true)
  const [routes, setRoutes] = useState<Route[]>([])
  const [releasePlan, setReleasePlan] = useState<
    {
      route: Route
      buses: { bus: BusType; driver: Driver | null }[]
    }[]
  >([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Загрузка маршрутов
        const routesResponse = await routeService.getAll()
        if (!routesResponse.isSuccess || !routesResponse.value) {
          throw new Error(routesResponse.error || "Не удалось получить данные о маршрутах")
        }

        setRoutes(routesResponse.value)

        // Загрузка автобусов и водителей
        const [busesResponse, driversResponse] = await Promise.all([busService.getAll(), driverService.getAll()])

        if (busesResponse.isSuccess && busesResponse.value && driversResponse.isSuccess && driversResponse.value) {
          // Имитация данных плана выпуска
          // В реальном приложении это должно приходить из API
          const mockPlan = routesResponse.value.map((route) => {
            // Для каждого маршрута выбираем несколько автобусов
            const busCount = Math.floor(Math.random() * 5) + 1 // от 1 до 5 автобусов
            const buses = busesResponse.value
              .filter((bus) => bus.busStatus === "Operational")
              .slice(0, busCount)
              .map((bus) => {
                // Подбираем случайного водителя
                const randomDriver = driversResponse.value[Math.floor(Math.random() * driversResponse.value.length)]
                return {
                  bus,
                  driver: Math.random() > 0.3 ? randomDriver : null, // 30% шанс, что водитель не назначен
                }
              })

            return {
              route,
              buses,
            }
          })

          setReleasePlan(mockPlan)
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err)
        setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке данных")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Обработчик подтверждения плана выпуска
  const handleConfirmPlan = () => {
    // Здесь должен быть API запрос для подтверждения плана
    // В данном примере просто показываем уведомление
    toast({
      title: "План подтвержден",
      description: "План выпуска автобусов успешно подтвержден",
    })
  }

  // Обработчик экспорта плана
  const handleExportPlan = () => {
    toast({
      title: "Экспорт план",
      description: "План выпуска экспортирован в PDF",
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-lg mt-4"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <Link href="/dashboard/fleet-manager/release-plan">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к плану выпуска
          </Button>
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      </div>
    )
  }

  // Общее количество автобусов и водителей в плане выпуска
  const totalBuses = releasePlan.reduce((acc, item) => acc + item.buses.length, 0)
  const totalDrivers = releasePlan.reduce((acc, item) => {
    return acc + item.buses.filter((bus) => bus.driver !== null).length
  }, 0)
  const totalRoutes = releasePlan.length

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/fleet-manager/release-plan">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-700">Итоговый план выпуска</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString("ru-RU", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Сводная информация */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bus className="h-4 w-4 text-sky-500" />
              Всего автобусов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBuses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-sky-500" />
              Маршрутов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRoutes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-500" />
              Назначено водителей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDrivers} из {totalBuses}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* План выпуска по маршрутам */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-500" />
              План выпуска по маршрутам
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPlan}>
                <Download className="mr-2 h-4 w-4" />
                Экспорт
              </Button>
              <Button onClick={handleConfirmPlan}>
                <Check className="mr-2 h-4 w-4" />
                Подтвердить план
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {releasePlan.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">План выпуска пуст</h3>
                <p className="text-gray-500 mb-4">Нет данных о плане выпуска автобусов</p>
                <Link href="/dashboard/fleet-manager/release-plan">
                  <Button>Вернуться к планированию</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {releasePlan.map((planItem) => (
                  <div key={planItem.route.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-sky-50 p-3 border-b">
                      <h3 className="font-medium text-sky-700">Маршрут №{planItem.route.number}</h3>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>№</TableHead>
                          <TableHead>Гос. номер</TableHead>
                          <TableHead>Гаражный номер</TableHead>
                          <TableHead>Водитель</TableHead>
                          <TableHead>Статус</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {planItem.buses.map((item, index) => (
                          <TableRow key={`${item.bus.id}-${index}`}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{item.bus.govNumber}</TableCell>
                            <TableCell>{item.bus.garageNumber}</TableCell>
                            <TableCell>
                              {item.driver ? item.driver.fullName : <span className="text-red-500">Не назначен</span>}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                Готов к выпуску
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Link href="/dashboard/fleet-manager/release-plan">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Вернуться к планированию
                </Button>
              </Link>
              <Button onClick={handleConfirmPlan} disabled={releasePlan.length === 0}>
                <Send className="mr-2 h-4 w-4" />
                Отправить на утверждение
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

