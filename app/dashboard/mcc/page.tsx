"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { format } from "date-fns"
import { getAuthData } from "@/lib/auth-utils"
import { DateRangePicker } from "../repairs/misc/components/DateRangePicker"

interface ConvoyStat {
  convoyId: string
  convoyNumber: number
  unscheduled: number
  longTerm: number
  other: number
  total: number
}

export default function MCCDashboardPage() {
  const [convoyStats, setConvoyStats] = useState<ConvoyStat[]>([])
  const [from, setFrom] = useState<Date>(new Date())
  const [to, setTo] = useState<Date>(new Date())

  useEffect(() => {
    const loadStats = async () => {
      const auth = getAuthData()
      const depotId = auth?.busDepotId
      if (!depotId || !from || !to) return

      const fromStr = format(from, "yyyy-MM-dd")
      const toStr = format(to, "yyyy-MM-dd")

      const res = await routeExitRepairService.getStatsByDate(depotId, fromStr, toStr)

      if (res.isSuccess && res.value) {
        const grouped = res.value.byConvoy
        const convoyStats: ConvoyStat[] = Object.values(grouped).map((item: any) => {
          const total = (item.unplanned ?? 0) + (item.long ?? 0) + (item.other ?? 0)
          return {
            convoyId: item.convoyId,
            convoyNumber: item.convoyNumber,
            unscheduled: item.unplanned ?? 0,
            longTerm: item.long ?? 0,
            other: item.other ?? 0,
            total,
          }
        })

        setConvoyStats(convoyStats)
      }
    }

    loadStats()
  }, [from, to])

  const totalSummary = useMemo(() => {
    return convoyStats.reduce(
      (acc, curr) => {
        acc.unscheduled += curr.unscheduled
        acc.longTerm += curr.longTerm
        acc.other += curr.other
        acc.total += curr.total
        return acc
      },
      { unscheduled: 0, longTerm: 0, other: 0, total: 0 }
    )
  }, [convoyStats])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Обзор ремонтов по колоннам</h1>

      <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      {convoyStats.length === 0 ? (
        <p className="text-gray-500 mt-4">Нет данных по колоннам за выбранный период</p>
      ) : (
        <>
          <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Итог по автопарку:</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>🔧 Неплановые: <strong>{totalSummary.unscheduled}</strong></div>
              <div className="text-yellow-700">🛠️ Плановые ТО: <strong>{totalSummary.longTerm}</strong></div>
              <div className="text-gray-600">📄 Прочее: <strong>{totalSummary.other}</strong></div>
              <div className="font-bold">Всего ремонтов: {totalSummary.total}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {convoyStats.map((stat) => (
              <Card key={stat.convoyId}>
                <CardHeader>
                  <CardTitle>Колонна №{stat.convoyNumber}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>🔧 Неплановый</span>
                    <span className="font-bold">{stat.unscheduled}</span>
                  </div>
                  <div className="flex justify-between text-yellow-600">
                    <span>🛠️ Плановый ТО</span>
                    <span className="font-bold">{stat.longTerm}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>📄 Прочее</span>
                    <span className="font-bold">{stat.other}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Всего ремонтов</span>
                    <span>{stat.total}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}