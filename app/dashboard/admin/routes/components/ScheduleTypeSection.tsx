"use client"

import { Button } from "@/components/ui/button"
import type { Route } from "../types"
import RouteCard from "./RouteCard"
import { Calendar, Plus, RouteIcon } from "lucide-react"
import { getScheduleTypeName } from "../utils/scheduleUtils"

interface ScheduleTypeSectionProps {
  title: string
  scheduleType: "workdays" | "saturday" | "sunday"
  routes: Route[]
  onAddRoute: (scheduleType: "workdays" | "saturday" | "sunday") => void
  onEditRoute: (route: Route) => void
  onDeleteRoute: (id: string) => void
}

export default function ScheduleTypeSection({
  title,
  scheduleType,
  routes,
  onAddRoute,
  onEditRoute,
  onDeleteRoute,
}: ScheduleTypeSectionProps) {
  // Определяем цвета в зависимости от типа расписания
  const headerColor =
    scheduleType === "workdays" ? "text-blue-700" : scheduleType === "saturday" ? "text-amber-700" : "text-green-700"

  const iconColor =
    scheduleType === "workdays" ? "text-blue-500" : scheduleType === "saturday" ? "text-amber-500" : "text-green-500"

  const buttonColor =
    scheduleType === "workdays"
      ? "bg-blue-500 hover:bg-blue-600"
      : scheduleType === "saturday"
        ? "bg-amber-500 hover:bg-amber-600"
        : "bg-green-500 hover:bg-green-600"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold flex items-center gap-2 ${headerColor}`}>
          <Calendar className={`h-5 w-5 ${iconColor}`} />
          {title} ({getScheduleTypeName(scheduleType)})
        </h2>
        <Button className={buttonColor} onClick={() => onAddRoute(scheduleType)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить маршрут
        </Button>
      </div>

      {routes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <RouteIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Нет маршрутов</h3>
          <p className="text-gray-500 mb-4">
            Добавьте первый маршрут для {getScheduleTypeName(scheduleType).toLowerCase()}
          </p>
          <Button className={buttonColor} onClick={() => onAddRoute(scheduleType)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить маршрут
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} onEdit={onEditRoute} onDelete={onDeleteRoute} />
          ))}
        </div>
      )}
    </div>
  )
}

