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
import { useEffect, useState } from "react"
import { getAuthData } from "@/lib/auth-utils"
import { statisticService } from "@/service/statisticService"
import { format, subMonths } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DailyConvoyStat {
  date: string
  plannedCount: number
  plannedRepairCount: number
  unplannedRepairCount: number
  reserveCount: number
  orderCount: number
}

interface ConvoyDailyStatsResponse {
  convoyId: string
  convoyNumber: number
  dailyStats: DailyConvoyStat[]
}

export default function LRTDashboardCompareChart() {
  const [data, setData] = useState<
    { convoyNumber: number; chartData: any[] }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuthData()
      if (!auth?.busDepotId) return

      setLoading(true)
      const now = new Date()
      const currentStart = format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd")
      const currentEnd = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), "yyyy-MM-dd")

      const prev = subMonths(now, 1)
      const prevStart = format(new Date(prev.getFullYear(), prev.getMonth(), 1), "yyyy-MM-dd")
      const prevEnd = format(new Date(prev.getFullYear(), prev.getMonth() + 1, 0), "yyyy-MM-dd")

      const [curData, prevData] = await Promise.all([
        statisticService.getConvoyDispatchRepairStats(auth.busDepotId, currentStart, currentEnd),
        statisticService.getConvoyDispatchRepairStats(auth.busDepotId, prevStart, prevEnd),
      ])

      const result = curData.map((convoy) => {
        const prevConvoy = prevData.find(c => c.convoyId === convoy.convoyId)
        const map: Record<string, any> = {}

        convoy.dailyStats.forEach((stat) => {
          if (!map[stat.date]) {
            map[stat.date] = {
              date: stat.date,
              plannedCurrent: 0,
              unscheduledCurrent: 0,
              plannedPrev: 0,
              unscheduledPrev: 0,
            }
          }
          map[stat.date].plannedCurrent += stat.plannedCount
          map[stat.date].unscheduledCurrent += stat.unplannedRepairCount
        })

        prevConvoy?.dailyStats.forEach((stat) => {
          if (!map[stat.date]) {
            map[stat.date] = {
              date: stat.date,
              plannedCurrent: 0,
              unscheduledCurrent: 0,
              plannedPrev: 0,
              unscheduledPrev: 0,
            }
          }
          map[stat.date].plannedPrev += stat.plannedCount
          map[stat.date].unscheduledPrev += stat.unplannedRepairCount
        })

        const chartData = Object.values(map).sort((a, b) => a.date.localeCompare(b.date))

        return {
          convoyNumber: convoy.convoyNumber,
          chartData,
        }
      })

      setData(result)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <p>Загрузка...</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sky-700">Сравнение месяцев по колоннам</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {data.length === 0 ? (
          <p>Нет данных</p>
        ) : (
          data.map(({ convoyNumber, chartData }) => (
            <div key={convoyNumber}>
              <h3 className="text-lg font-semibold text-sky-600 mb-2">
                Колонна №{convoyNumber}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) => str.slice(8)}
                    label={{ value: "Число", position: "insideBottomRight", offset: -5 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="plannedCurrent"
                    stroke="#3b82f6"
                    name="Маршруты (Текущий)"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="plannedPrev"
                    stroke="#93c5fd"
                    name="Маршруты (Прошлый)"
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="unscheduledCurrent"
                    stroke="#ef4444"
                    name="Сходы с линий (Текущий)"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="unscheduledPrev"
                    stroke="#fca5a5"
                    name="Сходы с линий (Прошлый)"
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
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
