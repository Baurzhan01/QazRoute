"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useEffect, useState } from "react"
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
} from "date-fns"
import { getAuthData } from "@/lib/auth-utils"
import { statisticService } from "@/service/statisticService"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"

type Period = "current" | "previous" | "7days" | "custom"

export default function LRTDashboardDepotLineCharts() {
  const [depotId, setDepotId] = useState("")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>("current")
  const [dateRange, setDateRange] = useState<DateRange>()

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
      const res = await statisticService.getDispatchRepairStats(
        depotId,
        format(start, "yyyy-MM-dd"),
        format(end, "yyyy-MM-dd")
      )
      setData(res || [])
      setLoading(false)
    }

    fetchData()
  }, [depotId, period, dateRange])

  const chartConfigs = [
    { key: "plannedCount", name: "Маршруты", color: "#3b82f6" },
    { key: "plannedRepairCount", name: "Плановые ремонты", color: "#fbbf24" },
    { key: "unplannedRepairCount", name: "Сходы с линии", color: "#ef4444" },
    { key: "reserveCount", name: "Резерв", color: "#a3e635" },
    { key: "orderCount", name: "Заказы", color: "#34d399" },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-sky-700">Динамика по автобусному парку</CardTitle>
          <p className="text-muted-foreground text-sm">
            Отображает статистику по дням
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <Tabs value={period} onValueChange={(val) => setPeriod(val as Period)}>
            <TabsList>
              <TabsTrigger value="current">Текущий месяц</TabsTrigger>
              <TabsTrigger value="previous">Прошлый месяц</TabsTrigger>
              <TabsTrigger value="7days">7 дней</TabsTrigger>
              <TabsTrigger value="custom">Период</TabsTrigger>
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
        ) : (
          chartConfigs.map((conf) => (
            <div key={conf.key}>
              <h3 className="text-base font-medium text-muted-foreground mb-2">{conf.name}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(parseISO(date), "dd.MM")}
                    label={{ value: "Дата", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={conf.key}
                    stroke={conf.color}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name={conf.name}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
