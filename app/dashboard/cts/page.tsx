"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, ClipboardList, Clock, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { getAuthData } from "@/lib/auth-utils"

type RepairType = "Planned" | "Unscheduled" | "LongTerm" | "Other"

interface DashboardStat {
  type: RepairType | "Messages"
  title: string
  value: number
  icon: React.ReactNode
  bgColor: string
  href: string
}

export default function CTSHomePage() {
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const today = useMemo(() => new Date().toISOString().split("T")[0], [])

  useEffect(() => {
    const fetchStats = async () => {
      const auth = getAuthData()
      const depotId = auth?.busDepotId
      if (!depotId) return

      try {
        const res = await routeExitRepairService.getStatsByDate(depotId, today, today)

        if (res.isSuccess && res.value) {
          const grouped = res.value.byConvoy

          const aggregate = (type: RepairType): number =>
            Object.entries(grouped).reduce((sum, [key, count]) =>
              key.endsWith(`|${type}`) ? sum + count : sum, 0)

          setStats([
            {
              type: "Planned",
              title: "Плановый ремонт",
              value: aggregate("Planned"),
              icon: <ClipboardList className="w-6 h-6 text-sky-700" />,
              bgColor: "bg-sky-100",
              href: "/dashboard/cts/repairs/plan",
            },
            {
              type: "Unscheduled",
              title: "Неплановый ремонт",
              value: aggregate("Unscheduled"),
              icon: <Wrench className="w-6 h-6 text-amber-700" />,
              bgColor: "bg-amber-100",
              href: "/dashboard/cts/repairs/unscheduled-repairs",
            },
            {
              type: "LongTerm",
              title: "Длительный ремонт",
              value: aggregate("LongTerm"),
              icon: <Clock className="w-6 h-6 text-rose-700" />,
              bgColor: "bg-rose-100",
              href: "/dashboard/cts/repairs/long-repairs",
            },
            {
              type: "Messages",
              title: "Сообщения",
              value: 0,
              icon: <Bell className="w-6 h-6 text-lime-700" />,
              bgColor: "bg-lime-100",
              href: "/dashboard/cts/messages",
            },
          ])
        }
      } catch {
        setStats([])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [today])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-sky-800">Панель КТС</h1>

      {loading ? (
        <p className="text-gray-500 text-sm">Загрузка статистики...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card
              key={stat.type}
              onClick={() => router.push(stat.href)}
              className={cn(
                stat.bgColor,
                "shadow-sm cursor-pointer transition hover:shadow-md hover:scale-[1.02]"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md font-semibold text-gray-700">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
