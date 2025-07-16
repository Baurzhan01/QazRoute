"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useEffect, useMemo, useState } from "react"
import { format, parseISO, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns"
import { getAuthData } from "@/lib/auth-utils"
import { statisticService } from "@/service/statisticService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRange } from "react-day-picker"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"

export default function LRTDashboardLineChart() {
  const [depotId, setDepotId] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"current" | "previous" | "7days" | "custom">("current")

  useEffect(() => {
    const auth = getAuthData()
    if (auth?.busDepotId) {
      setDepotId(auth.busDepotId)
    }
  }, [])

  useEffect(() => {
    if (!depotId) return

    let start: Date, end: Date
    const today = new Date()

    switch (period) {
      case "current":
        start = startOfMonth(today)
        end = today
        break
      case "previous":
        start = startOfMonth(subMonths(today, 1))
        end = endOfMonth(subMonths(today, 1))
        break
      case "7days":
        start = subDays(today, 6)
        end = today
        break
      case "custom":
        if (!dateRange?.from || !dateRange.to) return
        start = dateRange.from
        end = dateRange.to
        break
    }

    const fetchData = async () => {
      setLoading(true)
      const res = await statisticService.getConvoyDispatchRepairStats(
        depotId,
        format(start, "yyyy-MM-dd"),
        format(end, "yyyy-MM-dd")
      )
      setData(res)
      setLoading(false)
    }

    fetchData()
  }, [depotId, period, dateRange])

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-sky-700">Статистика по дням по колоннам</CardTitle>
          <p className="text-muted-foreground text-sm">
            Каждая колонна отображается отдельно
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <Tabs value={period} onValueChange={(val) => setPeriod(val as any)} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="current">Текущий месяц</TabsTrigger>
              <TabsTrigger value="previous">Прошлый месяц</TabsTrigger>
              <TabsTrigger value="7days">7 дней</TabsTrigger>
              <TabsTrigger value="custom">Выбрать</TabsTrigger>
            </TabsList>
          </Tabs>
          {period === "custom" && (
            <CalendarDateRangePicker date={dateRange} setDate={setDateRange} />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-10">
        {loading ? (
          <p>Загрузка...</p>
        ) : data.length === 0 ? (
          <p>Нет данных за выбранный период</p>
        ) : (
          data.map((convoy: any) => {
            const chartData = convoy.dailyStats.map((day: any) => ({
              date: day.date,
              planned: day.plannedCount || 0,
              repairs: day.plannedRepairCount || 0,
              reserve: day.reserveCount || 0,
              orders: day.orderCount || 0,
              unscheduled: day.unplannedRepairCount || 0,
            }))

            return (
              <div key={convoy.convoyId} className="space-y-2">
                <h3 className="text-lg font-semibold text-sky-600">
                  Колонна №{convoy.convoyNumber}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(parseISO(date), "dd.MM")}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="planned" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} name="Маршруты" />
                    <Line type="monotone" dataKey="repairs" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4 }} name="План. ремонты" />
                    <Line type="monotone" dataKey="unscheduled" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} name="Сходы с линий" />
                    <Line type="monotone" dataKey="reserve" stroke="#a3e635" strokeWidth={3} dot={{ r: 4 }} name="Резерв" />
                    <Line type="monotone" dataKey="orders" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} name="Заказы" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
