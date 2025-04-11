"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
  import type { BusWithDrivers } from "@/types/bus.types"
import { getBusStatusInfo } from "../utils/busStatusUtils"

interface ViewBusDialogProps {
  bus: BusWithDrivers
  open: boolean
  onClose: () => void
}

export default function ViewBusDialog({ bus, open, onClose }: ViewBusDialogProps) {
  const { color, icon: StatusIcon, label } = getBusStatusInfo(bus.busStatus)

  const [convoyNumber, setConvoyNumber] = useState<string | null>(null)

  useEffect(() => {
    const authData = localStorage.getItem("authData")
    console.log(bus);
    
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        setConvoyNumber(parsed?.convoyNumber ?? null)
      } catch (err) {
        console.error("Ошибка чтения колонны из localStorage", err)
      }
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Информация об автобусе</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Гаражный номер</p>
              <p className="text-lg font-semibold">{bus.garageNumber}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Гос. номер</p>
              <p className="text-lg font-semibold">{bus.govNumber || "—"}</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Статус</p>
              <Badge className={`${color.bg} ${color.text} flex items-center gap-1 mt-1`}>
                <StatusIcon className="h-3 w-3" />
                {label}
              </Badge>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Колонна</p>
              <p className="text-lg font-semibold">{convoyNumber ?? "—"}</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Дополнительная информация</p>
              <p className="text-sm mt-1">{bus.additionalInfo || "Нет дополнительной информации"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Назначенные водители</p>
            {bus.drivers.length > 0 ? (
              <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                {bus.drivers.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">№ {driver.serviceNumber}</p>
                      <p className="text-sm text-gray-600">{driver.fullName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Нет назначенных водителей</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
