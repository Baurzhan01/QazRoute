// app/dashboard/mcc/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { format } from "date-fns"
import { getAuthData } from "@/lib/auth-utils"

interface ConvoyStat {
  convoyNumber: string
  unscheduled: number
  longTerm: number
  other: number
  total: number
}

export default function MCCDashboardPage() {
  const [convoyStats, setConvoyStats] = useState<ConvoyStat[]>([])

  useEffect(() => {
    const loadStats = async () => {
      const auth = getAuthData()
      const depotId = auth?.busDepotId
      if (!depotId) return

      const today = format(new Date(), "yyyy-MM-dd")
      const res = await routeExitRepairService.getStatsByDate(depotId, today, today)

      if (res.isSuccess && res.value) {
        const grouped = res.value.byConvoy
        const convoyNumbers = Array.from(
          new Set(Object.keys(grouped).map((key) => key.split("|")[0]))
        )

        const stats: ConvoyStat[] = convoyNumbers.map((convoy) => {
          const unscheduled = grouped[`${convoy}|Unscheduled`] ?? 0
          const longTerm = grouped[`${convoy}|LongTerm`] ?? 0
          const other = grouped[`${convoy}|Other`] ?? 0
          const total = unscheduled + longTerm + other
          return { convoyNumber: convoy, unscheduled, longTerm, other, total }
        })

        setConvoyStats(stats)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {convoyStats.length === 0 ? (
        <p className="text-gray-500">Нет данных по колоннам за сегодня</p>
      ) : (
        convoyStats.map((stat) => (
          <Card key={stat.convoyNumber}>
            <CardHeader>
              <CardTitle>Колонна №{stat.convoyNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>🔧 Неплановый</span>
                <span className="font-bold">{stat.unscheduled}</span>
              </div>
              <div className="flex justify-between text-yellow-600">
                <span>🛠️ Плановый (долгоср.)</span>
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
        ))
      )}
    </div>
  )
}
