"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getAuthData } from "@/lib/auth-utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import { routeService } from "@/service/routeService"
import { convoyService } from "@/service/convoyService"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"
import GuideDepotLineCharts from "./components/GuideDepotLineCharts"
import { statisticService } from "@/service/statisticService"

type KPI = {
  title: string
  value: number
  accent?: string
  href?: string
}

export default function GuideDashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(false)

  const [kpi, setKpi] = useState<KPI[]>([])
  const [latestIncidents, setLatestIncidents] = useState<RouteExitRepairDto[]>([])
  const [metaCounts, setMetaCounts] = useState({
    buses: 0,
    drivers: 0,
    routes: 0,
    convoys: 0,
    plannedLines: 0,
    incidents: 0,
  })

  const depotId = getAuthData()?.busDepotId || ""
  const formattedDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate])

  useEffect(() => {
    const dt = searchParams.get("date")
    if (dt) {
      const parsed = new Date(dt)
      if (!isNaN(parsed.getTime())) setSelectedDate(parsed)
    }
  }, [searchParams])

  useEffect(() => {
    if (!depotId) return
    const load = async () => {
      setLoading(true)
      try {
        const [statsRes, busesRes, driversRes, routesRes, convoysRes, incidentsRes, dispatchStats] = await Promise.all([
          routeExitRepairService.getStatsByDate(depotId, formattedDate, formattedDate),
          busService.getByDepot(depotId, "1", "1000"),
          driverService.getByDepotId(depotId),
          routeService.getAll(),
          convoyService.getByDepotId(depotId),
          routeExitRepairService.getByDate(formattedDate, depotId),
          statisticService.getDispatchRepairStats(depotId, formattedDate, formattedDate),
        ])

        const planned = statsRes.isSuccess ? statsRes.value?.totalPlanned ?? 0 : 0
        const unplanned = statsRes.isSuccess ? statsRes.value?.totalUnplanned ?? 0 : 0
        const long = statsRes.isSuccess ? statsRes.value?.totalLong ?? 0 : 0

        const busesCount =
          busesRes?.value?.totalCount ??
          busesRes?.value?.value?.totalCount ??
          busesRes?.value?.items?.length ??
          0
        const driversCount = driversRes?.value?.length ?? 0
        // уникальные маршруты по номеру
        const routeNumbers = new Set<string | number>()
        routesRes?.value?.forEach((r) => {
          if (r.number) routeNumbers.add(r.number)
        })
        const routesCount = routeNumbers.size
        const convoysCount = convoysRes?.value?.length ?? 0

        const incidentsList =
          incidentsRes.isSuccess && incidentsRes.value
            ? incidentsRes.value.filter((r) => r.repairType === "Unscheduled" || r.repairType === "LongTerm")
            : []
        const incidents = incidentsList.slice(0, 10)

        const plannedLines =
          dispatchStats && Array.isArray(dispatchStats)
            ? dispatchStats.reduce((sum: number, d: any) => sum + (d.plannedCount ?? 0), 0)
            : 0

        setLatestIncidents(incidents)
        setMetaCounts({
          buses: busesCount,
          drivers: driversCount,
          routes: routesCount,
          convoys: convoysCount,
          plannedLines,
          incidents: incidentsList.length,
        })

        setKpi([
          { title: "Плановые ремонты", value: planned, href: `/dashboard/cts/repairs/plan?date=${formattedDate}` },
          { title: "Неплановые ремонты", value: unplanned, href: `/dashboard/cts/repairs/unscheduled-repairs?date=${formattedDate}` },
          { title: "Длительные ремонты", value: long, href: `/dashboard/cts/repairs/long-repairs?date=${formattedDate}` },
          { title: "Сходы", value: incidents.length, href: `/dashboard/cts/repairs/unscheduled-repairs?date=${formattedDate}` },
        ])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [depotId, formattedDate])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sky-800">Панель Руководства</h1>
          <p className="text-sm text-gray-600">Сводка по депо на выбранную дату</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Дата:</span>
          <Input
            type="date"
            className="h-9 w-[170px]"
            value={formattedDate}
            onChange={(e) => {
              if (!e.target.value) return
              const tmp = new Date(`${e.target.value}T00:00:00`)
              if (!isNaN(tmp.getTime())) {
                setSelectedDate(tmp)
                router.replace(`?date=${e.target.value}`)
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map((item) => (
          <Card
            key={item.title}
            className={cn("cursor-pointer transition hover:shadow-md")}
            onClick={() => item.href && router.push(item.href)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-gray-900">{item.value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Автобусы</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metaCounts.buses}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Водители</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metaCounts.drivers}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Маршруты</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metaCounts.routes}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Автоколонны</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metaCounts.convoys}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Запланировано выпусков</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metaCounts.plannedLines}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Сходы (неплановые)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metaCounts.incidents}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние инциденты (сходы / неплановые)</CardTitle>
        </CardHeader>
        <CardContent>
          {latestIncidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет данных за выбранную дату</p>
          ) : (
            <div className="space-y-2">
              {latestIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{inc.bus?.govNumber || inc.bus?.garageNumber || "—"}</span>
                    <span className="text-xs text-muted-foreground">
                      {inc.route?.number ? `Маршрут ${inc.route.number}` : "Маршрут —"} •{" "}
                      {inc.convoy?.number ? `Колонна ${inc.convoy.number}` : "Колонна —"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {format(new Date(inc.startDate || formattedDate), "dd.MM.yyyy")}
                    <div>{inc.startTime?.slice(0, 5) || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <GuideDepotLineCharts />
    </div>
  )
}
