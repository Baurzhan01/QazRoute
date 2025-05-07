"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AssignedDriver {
  driverId: string
  driverName: string
}

interface ViewRouteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: {
    routeNumber: string
    startStation: string
    endStation: string
    assignedDrivers: AssignedDriver[]
  } | null
}

export default function ViewRouteDialog({ open, onOpenChange, route }: ViewRouteDialogProps) {
  if (!route) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Маршрут № {route.routeNumber}</DialogTitle>
          <DialogDescription>
            {route.startStation} → {route.endStation}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {route.assignedDrivers.length > 0 ? (
            route.assignedDrivers.map((driver, index) => (
              <div
                key={driver.driverId}
                className="flex justify-between items-center border rounded px-3 py-2"
              >
                <span>{driver.driverName}</span>
                <Badge variant="outline">Водитель {index + 1}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Нет назначенных водителей</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
