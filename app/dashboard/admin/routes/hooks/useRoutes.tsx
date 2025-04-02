"use client"

import type React from "react"

import { useState } from "react"
import type { Route, RouteFormData, ScheduleType } from "../types"
import { toast } from "@/components/ui/use-toast"

export function useRoutes(initialRoutes: Route[] = []) {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [formData, setFormData] = useState<RouteFormData>({
    name: "",
    exitNumbers: "",
    orderInSchedule: "",
    additionalInfo: "",
    station: "",
    scheduleType: "workdays",
  })

  // Обработчик изменения полей формы
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения выпадающих списков
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Если изменилась станция, определяем тип расписания
    if (name === "station") {
      const stationName = value.toLowerCase()
      let scheduleType: ScheduleType = "workdays"

      if (stationName.includes("суббот")) {
        scheduleType = "saturday"
      } else if (stationName.includes("воскрес")) {
        scheduleType = "sunday"
      } else {
        scheduleType = "workdays"
      }

      setFormData((prev) => ({ ...prev, scheduleType }))
    }
  }

  // Обработчик добавления нового маршрута
  const handleAddRoute = () => {
    if (!formData.name || !formData.exitNumbers) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля",
        variant: "destructive",
      })
      return false
    }

    const newRoute: Route = {
      id: Date.now().toString(),
      name: formData.name,
      exitNumbers: formData.exitNumbers,
      orderInSchedule: formData.orderInSchedule,
      additionalInfo: formData.additionalInfo,
      station: formData.station,
      scheduleType: formData.scheduleType,
    }

    setRoutes((prev) => [...prev, newRoute])

    // Сбрасываем форму
    setFormData({
      name: "",
      exitNumbers: "",
      orderInSchedule: "",
      additionalInfo: "",
      station: "",
      scheduleType: "workdays",
    })

    toast({
      title: "Успешно",
      description: `Маршрут "${newRoute.name}" успешно добавлен`,
    })

    return true
  }

  // Обработчик редактирования маршрута
  const handleEditRoute = () => {
    if (!selectedRoute) return false

    if (!formData.name || !formData.exitNumbers) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля",
        variant: "destructive",
      })
      return false
    }

    const updatedRoute: Route = {
      ...selectedRoute,
      name: formData.name,
      exitNumbers: formData.exitNumbers,
      orderInSchedule: formData.orderInSchedule,
      additionalInfo: formData.additionalInfo,
      station: formData.station,
      scheduleType: formData.scheduleType,
    }

    setRoutes((prev) => prev.map((route) => (route.id === selectedRoute.id ? updatedRoute : route)))

    toast({
      title: "Успешно",
      description: `Маршрут "${updatedRoute.name}" успешно обновлен`,
    })

    return true
  }

  // Обработчик удаления маршрута
  const handleDeleteRoute = (id: string) => {
    setRoutes((prev) => prev.filter((route) => route.id !== id))

    toast({
      title: "Успешно",
      description: "Маршрут успешно удален",
    })

    return true
  }

  // Открытие диалога редактирования маршрута
  const openEditRouteDialog = (route: Route) => {
    setSelectedRoute(route)
    setFormData({
      name: route.name,
      exitNumbers: route.exitNumbers,
      orderInSchedule: route.orderInSchedule,
      additionalInfo: route.additionalInfo,
      station: route.station,
      scheduleType: route.scheduleType,
    })
    return route
  }

  // Группировка маршрутов по типу расписания
  const routesByScheduleType = {
    workdays: routes.filter((route) => route.scheduleType === "workdays"),
    saturday: routes.filter((route) => route.scheduleType === "saturday"),
    sunday: routes.filter((route) => route.scheduleType === "sunday"),
  }

  return {
    routes,
    routesByScheduleType,
    selectedRoute,
    setSelectedRoute,
    formData,
    setFormData,
    handleFormChange,
    handleSelectChange,
    handleAddRoute,
    handleEditRoute,
    handleDeleteRoute,
    openEditRouteDialog,
  }
}

