"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import { routeService } from "@/service/routeService"
import { getAuthData } from "@/lib/auth-utils"

export function SeniorCounts() {
  const depotId = getAuthData()?.busDepotId || ""
  const [counts, setCounts] = useState({ buses: 0, drivers: 0, routes: 0 })

  useEffect(() => {
    const load = async () => {
      if (!depotId) return
      const [busesRes, driversRes, routesRes] = await Promise.all([
        busService.getByDepot(depotId, "1", "2000"),
        driverService.getByDepotId(depotId),
        routeService.getAll(),
      ])

      setCounts({
        buses: busesRes?.value?.value?.totalCount ?? 0,
        drivers: driversRes.value?.length ?? 0,
        routes: routesRes.value?.length ?? 0,
      })
    }
    load()
  }, [depotId])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-600">Автобусы</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{counts.buses}</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-600">Водители</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{counts.drivers}</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-600">Маршруты</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{counts.routes}</CardContent>
      </Card>
    </div>
  )
}
