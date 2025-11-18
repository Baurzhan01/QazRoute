"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getAuthData } from "@/lib/auth-utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

function GuideIncidentsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const depotId = getAuthData()?.busDepotId || ""

  const [selectedDate, setSelectedDate] = useState(new Date())
  const formattedDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate])
  const [items, setItems] = useState<RouteExitRepairDto[]>([])
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
        const res = await routeExitRepairService.filter({
          startDate: formattedDate,
          endDate: formattedDate,
          depotId,
          repairTypes: "Unscheduled",
        })
        setItems(res.isSuccess && res.value ? res.value : [])
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
          <h1 className="text-2xl font-bold text-sky-800">Сходы</h1>
          <p className="text-sm text-gray-600">Неплановые выходы за выбранную дату</p>
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
          <CardTitle>Список событий</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет сходов за выбранную дату</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-3 py-2 text-left">Автобус</th>
                    <th className="px-3 py-2 text-left">Маршрут</th>
                    <th className="px-3 py-2 text-left">Колонна</th>
                    <th className="px-3 py-2 text-left">Время</th>
                    <th className="px-3 py-2 text-left">Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">
                        {r.bus?.govNumber || r.bus?.garageNumber || "—"}
                      </td>
                      <td className="px-3 py-2">{r.route?.number || "—"}</td>
                      <td className="px-3 py-2">
                        {r.convoy?.number ? `Автоколонна №${r.convoy.number}` : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {format(new Date(r.startDate || formattedDate), "dd.MM.yyyy")}{" "}
                        {r.startTime?.slice(0, 5) || ""}
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

export default function GuideIncidentsPageWrapper() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Загрузка...</div>}>
      <GuideIncidentsPage />
    </Suspense>
  )
}
