"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getAuthData } from "@/lib/auth-utils"
import { convoyService } from "@/service/convoyService"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { releasePlanService } from "@/service/releasePlanService"
import { getDayTypeFromDate } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/dateUtils"

type ConvoyMetrics = {
  convoyId: string
  convoyNumber?: number
  buses: number
  drivers: number
  routes: number
  plannedLines: number
  incidents: number
}

export default function GuideConvoysPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const depotId = getAuthData()?.busDepotId || ""
  const [selectedDate, setSelectedDate] = useState(new Date())
  const formattedDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate])
  const dayType = useMemo(() => getDayTypeFromDate(formattedDate), [formattedDate])

  const [rows, setRows] = useState<ConvoyMetrics[]>([])
  const [loading, setLoading] = useState(false)

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
        const [convoysRes, busesRes, driversRes, repairsRes] = await Promise.all([
          convoyService.getByDepotId(depotId),
          busService.getByDepot(depotId, "1", "2000"),
          driverService.getByDepotId(depotId),
          routeExitRepairService.filter({
            startDate: formattedDate,
            endDate: formattedDate,
            depotId,
            repairTypes: "all",
          }),
        ])

        const convoys = convoysRes.value ?? []
        const buses = busesRes?.value?.value?.items ?? []
        const drivers = driversRes.value ?? []
        const repairs = repairsRes.isSuccess && repairsRes.value ? repairsRes.value : []

        const metrics: ConvoyMetrics[] = await Promise.all(
          convoys.map(async (c) => {
            const busesCount = buses.filter((b) => b.convoyId === c.id).length
            const driversCount = drivers.filter((d) => d.convoyId === c.id).length
            const incidents = repairs.filter(
              (r) => r.convoy?.id === c.id && r.repairType === "Unscheduled"
            ).length

            let routes = 0
            let plannedLines = 0

            try {
              const dispatchRes = await releasePlanService.getFullDispatchByDate(
                formattedDate,
                c.id,
                dayType
              )
              const routeGroups = dispatchRes.value?.routeGroups ?? []
              const uniqueRoutes = new Set<string>()
              routeGroups.forEach((group) => {
                if (group.routeNumber) uniqueRoutes.add(group.routeNumber)
                else if ((group as any).routeId) uniqueRoutes.add((group as any).routeId)
                plannedLines += group.assignments?.length ?? 0
              })
              routes = uniqueRoutes.size
            } catch {
              routes = 0
              plannedLines = 0
            }

            return {
              convoyId: c.id,
              convoyNumber: c.number,
              buses: busesCount,
              drivers: driversCount,
              routes,
              plannedLines,
              incidents,
            }
          })
        )

        setRows(metrics)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [depotId, formattedDate, dayType])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-800">Сводка по автоколоннам</h1>
          <p className="text-sm text-gray-600">Данные по ресурсам и выпуску за выбранную дату</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Дата:</span>
          <Input
            type="date"
            className="h-9 w-[170px]"
            value={formattedDate}
            onChange={(e) => {
              const val = e.target.value
              if (!val) return
              const next = new Date(`${val}T00:00:00`)
              if (!isNaN(next.getTime())) {
                setSelectedDate(next)
                router.replace(`?date=${val}`)
              }
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Автоколонны</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет данных.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-3 py-2 text-left">Автоколонна</th>
                    <th className="px-3 py-2 text-left">Автобусов</th>
                    <th className="px-3 py-2 text-left">Водителей</th>
                    <th className="px-3 py-2 text-left">Маршрутов</th>
                    <th className="px-3 py-2 text-left">Запланировано на линию</th>
                    <th className="px-3 py-2 text-left">Сходов</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.convoyId} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">
                        {row.convoyNumber ? (
                          <Link
                            className="text-sky-600 hover:underline"
                            href={`/dashboard/guide/convoys/${row.convoyId}?date=${formattedDate}`}
                          >
                            Автоколонна №{row.convoyNumber}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2">{row.buses}</td>
                      <td className="px-3 py-2">{row.drivers}</td>
                      <td className="px-3 py-2">{row.routes}</td>
                      <td className="px-3 py-2">{row.plannedLines}</td>
                      <td className="px-3 py-2">{row.incidents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
