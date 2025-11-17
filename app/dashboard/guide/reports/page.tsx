"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getAuthData } from "@/lib/auth-utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export default function GuideReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const depotId = getAuthData()?.busDepotId || ""

  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const formattedStart = useMemo(() => format(startDate, "yyyy-MM-dd"), [startDate])
  const formattedEnd = useMemo(() => format(endDate, "yyyy-MM-dd"), [endDate])

  const [items, setItems] = useState<RouteExitRepairDto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const s = searchParams.get("startDate")
    const e = searchParams.get("endDate")
    if (s) {
      const d = new Date(s)
      if (!isNaN(d.getTime())) setStartDate(d)
    }
    if (e) {
      const d = new Date(e)
      if (!isNaN(d.getTime())) setEndDate(d)
    }
  }, [searchParams])

  useEffect(() => {
    if (!depotId) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await routeExitRepairService.filter({
          startDate: formattedStart,
          endDate: formattedEnd,
          depotId,
          repairTypes: "all",
        })
        setItems(res.isSuccess && res.value ? res.value : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [depotId, formattedStart, formattedEnd])

  const count = (type: string) => items.filter((r) => r.repairType === type).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-800">Отчеты по ремонтам</h1>
          <p className="text-sm text-gray-600">Диапазон дат и сводка</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">С:</span>
            <Input
              type="date"
              className="h-9 w-[150px]"
              value={formattedStart}
              onChange={(e) => {
                if (!e.target.value) return
                const d = new Date(`${e.target.value}T00:00:00`)
                if (!isNaN(d.getTime())) {
                  setStartDate(d)
                  router.replace(`?startDate=${e.target.value}&endDate=${formattedEnd}`)
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">По:</span>
            <Input
              type="date"
              className="h-9 w-[150px]"
              value={formattedEnd}
              onChange={(e) => {
                if (!e.target.value) return
                const d = new Date(`${e.target.value}T00:00:00`)
                if (!isNaN(d.getTime())) {
                  setEndDate(d)
                  router.replace(`?startDate=${formattedStart}&endDate=${e.target.value}`)
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Плановые</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{count("Planned")}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Неплановые</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{count("Unscheduled")}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Длительные</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{count("LongTerm")}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список ремонтов</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет данных за период</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-3 py-2 text-left">Тип</th>
                    <th className="px-3 py-2 text-left">Дата</th>
                    <th className="px-3 py-2 text-left">Автобус</th>
                    <th className="px-3 py-2 text-left">Маршрут</th>
                    <th className="px-3 py-2 text-left">Колонна</th>
                    <th className="px-3 py-2 text-left">Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{r.repairType || "—"}</td>
                      <td className="px-3 py-2">{format(new Date(r.startDate || formattedStart), "dd.MM.yyyy")}</td>
                      <td className="px-3 py-2">{r.bus?.govNumber || r.bus?.garageNumber || "—"}</td>
                      <td className="px-3 py-2">{r.route?.number || "—"}</td>
                      <td className="px-3 py-2">
                        {r.convoy?.number ? `Автоколонна №${r.convoy.number}` : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {r.text ? r.text.replace(/<[^>]*>/g, "") : "—"}
                      </td>
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
