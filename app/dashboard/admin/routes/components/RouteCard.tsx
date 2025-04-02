"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RouteIcon, Edit, Trash2, MapPin, Calendar } from "lucide-react"
import type { Route } from "../types"
import { getScheduleTypeName, getScheduleTypeGradient } from "../utils/scheduleUtils"

interface RouteCardProps {
  route: Route
  onEdit: (route: Route) => void
  onDelete: (id: string) => void
}

export default function RouteCard({ route, onEdit, onDelete }: RouteCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className={`bg-gradient-to-r ${getScheduleTypeGradient(route.scheduleType)} text-white`}>
        <CardTitle className="flex items-center gap-2">
          <RouteIcon className="h-5 w-5" />
          Маршрут {route.name}
        </CardTitle>
        <CardDescription className="text-white/80">Номера выходов: {route.exitNumbers}</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${
                route.scheduleType === "workdays"
                  ? "bg-blue-100 text-blue-800"
                  : route.scheduleType === "saturday"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              <Calendar className="h-3 w-3 mr-1" />
              {getScheduleTypeName(route.scheduleType)}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-500 shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Станция</p>
              <p className="font-medium">{route.station || "Не указана"}</p>
            </div>
          </div>

          {route.orderInSchedule && (
            <div>
              <p className="text-sm text-gray-500">Порядок в разнорядке</p>
              <p>{route.orderInSchedule}</p>
            </div>
          )}

          {route.additionalInfo && (
            <div>
              <p className="text-sm text-gray-500">Дополнительная информация</p>
              <p className="text-sm">{route.additionalInfo}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => onEdit(route)}>
          <Edit className="mr-2 h-4 w-4" />
          Редактировать
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(route.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Удалить
        </Button>
      </CardFooter>
    </Card>
  )
}

