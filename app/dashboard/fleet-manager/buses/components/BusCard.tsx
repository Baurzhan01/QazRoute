"use client"

import { BusIcon, Eye, Edit, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BusWithDrivers } from "@/types/bus.types"
import { getBusStatusInfo } from "@/app/dashboard/fleet-manager/buses/utils/busStatusUtils"

interface BusCardProps {
  bus: BusWithDrivers
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAssignDriver: (id: string) => void
}

export default function BusCard({ bus, onView, onEdit, onDelete, onAssignDriver }: BusCardProps) {
  const { color, icon: StatusIcon, label } = getBusStatusInfo(bus.busStatus)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Левая часть с иконкой */}
          <div className={`p-4 flex items-center justify-center ${color.bg} w-full md:w-24`}>
            <BusIcon className={`h-12 w-12 ${color.text}`} />
          </div>

          {/* Основная информация */}
          <div className="flex-1 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Гаражный №: {bus.garageNumber}</h3>
                {bus.govNumber && <p className="text-sm text-gray-600">Гос. номер: {bus.govNumber}</p>}
              </div>

              <Badge className={`${color.bg} ${color.text} flex items-center gap-1 mt-2 md:mt-0`}>
                <StatusIcon className="h-3 w-3" />
                {label}
              </Badge>
            </div>

            {/* Водители */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Назначенные водители:</h4>
              {bus.drivers && bus.drivers.length > 0 ? (
                <div className="space-y-2">
                  {bus.drivers.map((driver) => (
                    <div key={driver.id} className="text-sm">
                      <span className="font-bold">№ {driver.serviceNumber || "—"}</span>{" "}
                      <span className="text-gray-600">{driver.fullName || "Без имени"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Нет назначенных водителей</p>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-wrap gap-2">
              {bus.drivers.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssignDriver(bus.id)}
                  className="flex items-center"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Назначить водителя
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={() => onView(bus.id)} className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Просмотр
              </Button>

              <Button variant="outline" size="sm" onClick={() => onEdit(bus.id)} className="flex items-center">
                <Edit className="h-4 w-4 mr-1" />
                Редактировать
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(bus.id)}
                className="flex items-center text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Удалить
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
