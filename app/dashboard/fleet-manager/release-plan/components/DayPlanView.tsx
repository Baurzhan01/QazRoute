"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AssignDialog from "./dialogs/AssignDialog"
import ViewRouteDialog from "./dialogs/ViewRouteDialog"
import type { DispatchRoute, ReserveDriver } from "@/types/releasePlanTypes"

interface DayPlanViewProps {
  routes: DispatchRoute[]
  reserves: ReserveDriver[]
  onAssignToReserve: (driverId: string) => void
  onRemoveFromReserve: (driverId: string) => void
  onAssignToBusLine: (routeId: string, driverId: string) => void
}

export default function DayPlanView({
  routes,
  reserves,
  onAssignToReserve,
  onRemoveFromReserve,
  onAssignToBusLine,
}: DayPlanViewProps) {
  // --- состояние для назначения
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [currentRoute, setCurrentRoute] = useState<DispatchRoute | null>(null)

  const availableDrivers = reserves.map((r) => ({ id: r.driverId, name: r.driverName }))

  const handleOpenAssign = (routeId: string) => {
    setSelectedRouteId(routeId)
    setAssignDialogOpen(true)
  }

  const handleSubmitAssign = () => {
    if (selectedRouteId && selectedDriverId) {
      onAssignToBusLine(selectedRouteId, selectedDriverId)
      setAssignDialogOpen(false)
      setSelectedDriverId(null)
    }
  }

  const handleOpenViewRoute = (route: DispatchRoute) => {
    setCurrentRoute(route)
    setViewDialogOpen(true)
  }

  return (
    <div className="grid gap-6">
      {/* ===== МАРШРУТЫ ===== */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Выходы по маршрутам</h2>
        {routes.map((route) => (
          <div key={route.routeId} className="border rounded p-4 shadow-sm bg-white space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-blue-700">Маршрут {route.routeNumber}</h3>
                <p className="text-sm text-gray-500">{route.startStation} → {route.endStation}</p>
              </div>
              <div className="flex gap-2">
                <Badge>{route.busLineNumber} выходов</Badge>
                <Button size="sm" variant="outline" onClick={() => handleOpenViewRoute(route)}>
                  Подробнее
                </Button>
                <Button size="sm" onClick={() => handleOpenAssign(route.routeId)}>
                  Назначить
                </Button>
              </div>
            </div>

            {route.assignedDrivers.length > 0 && (
              <div className="grid gap-1 mt-3">
                {route.assignedDrivers.map((driver, idx) => (
                  <div key={driver.driverId} className="flex justify-between text-sm text-muted-foreground">
                    <span>{driver.driverName}</span>
                    <span>Водитель {idx + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ===== РЕЗЕРВ ===== */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Резерв</h2>
        {reserves.length === 0 ? (
          <p className="text-sm text-gray-500">Резерв на этот день пуст.</p>
        ) : (
          <div className="grid gap-2">
            {reserves.map((reserve) => (
              <div key={reserve.driverId} className="flex justify-between items-center border rounded p-2">
                <span>{reserve.driverName}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveFromReserve(reserve.driverId)}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ====== DIALOGS ====== */}
      <AssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        availableDrivers={availableDrivers}
        selectedDriverId={selectedDriverId}
        onDriverChange={setSelectedDriverId}
        onSubmit={handleSubmitAssign}
      />

      <ViewRouteDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        route={currentRoute}
      />
    </div>
  )
}
