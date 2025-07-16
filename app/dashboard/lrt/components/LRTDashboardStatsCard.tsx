"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { useEffect, useMemo, useState } from "react"
import { getAuthData } from "@/lib/auth-utils"
import { statisticService } from "@/service/statisticService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DailyConvoyStat } from "@/types/statistic.types"

export default function LRTDashboardStatsChart() {
  const [view, setView] = useState("grouped")
  const [depotId, setDepotId] = useState("")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuthData()
    if (!auth?.busDepotId) return

    setDepotId(auth.busDepotId)

    const now = new Date()
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-30`

    const fetchData = async () => {
      setLoading(true)
      const res = await statisticService.getConvoyDispatchRepairStats(
        auth.busDepotId,
        startDate,
        endDate
      )
      setData(res)
      setLoading(false)
    }

    fetchData()
  }, [])

  const chartData = useMemo(() => {
    return data.map((convoy) => {
        const totals = convoy.dailyStats.reduce(
            (acc: { planned: number; plannedRepairs: number; unscheduled: number; reserve: number; orders: number }, day: DailyConvoyStat) => {
              acc.planned += day.plannedCount || 0
              acc.plannedRepairs += day.plannedRepairCount || 0
              acc.unscheduled += day.unplannedRepairCount || 0
              acc.reserve += day.reserveCount || 0
              acc.orders += day.orderCount || 0
              return acc
            },
            { planned: 0, plannedRepairs: 0, unscheduled: 0, reserve: 0, orders: 0 }
          )          
      return {
        convoyLabel: `Колонна №${convoy.convoyNumber}`,
        ...totals,
      }
    })
  }, [data])

  const selectedRadarData = chartData[0]
  const radarData = selectedRadarData
    ? [
        { category: "Маршруты", value: selectedRadarData.planned },
        { category: "План. ремонты", value: selectedRadarData.plannedRepairs },
        { category: "Сходы с линий", value: selectedRadarData.unscheduled },
        { category: "Резерв", value: selectedRadarData.reserve },
        { category: "Заказы", value: selectedRadarData.orders },
      ]
    : []

  if (loading) return <p>Загрузка...</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sky-700">Общая статистика по автоколоннам</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={view} onValueChange={setView} className="w-full">
          <TabsList>
            <TabsTrigger value="grouped">Группированная</TabsTrigger>
            <TabsTrigger value="stacked">Суммарная</TabsTrigger>
            <TabsTrigger value="radar">Радар</TabsTrigger>
          </TabsList>
          <TabsContent value="grouped">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="convoyLabel" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" fill="#60a5fa" name="Маршруты" />
                <Bar dataKey="plannedRepairs" fill="#fbbf24" name="План. ремонты" />
                <Bar dataKey="unscheduled" fill="#ef4444" name="Сходы с линий" />
                <Bar dataKey="reserve" fill="#a3e635" name="Резерв" />
                <Bar dataKey="orders" fill="#34d399" name="Заказы" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="stacked">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="convoyLabel" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" stackId="a" fill="#60a5fa" name="Маршруты" />
                <Bar dataKey="plannedRepairs" stackId="a" fill="#fbbf24" name="План. ремонты" />
                <Bar dataKey="unscheduled" stackId="a" fill="#ef4444" name="Сходы с линий" />
                <Bar dataKey="reserve" stackId="a" fill="#a3e635" name="Резерв" />
                <Bar dataKey="orders" stackId="a" fill="#34d399" name="Заказы" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="radar">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis />
                <Radar
                  name="Показатели"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
