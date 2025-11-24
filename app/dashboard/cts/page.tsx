"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Wrench, ClipboardList, Clock, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { getAuthData } from "@/lib/auth-utils"
import type { RouteExitRepairConvoyStat, RouteExitRepairStatsByDate } from "@/types/routeExitRepair.types"

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const router = useRouter()

  const formatLocalDate = (date: Date) => {
    const tzDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    return tzDate.toISOString().split("T")[0]
  }

  const formattedDate = useMemo(() => formatLocalDate(selectedDate), [selectedDate])
  const totalRepairs = useMemo(
    () => stats.filter((s) => s.type !== "Messages").reduce((sum, s) => sum + (s.value || 0), 0),
    [stats]
  )

  useEffect(() => {
    const fetchStats = async () => {
      const auth = getAuthData()
      const depotId = auth?.busDepotId
      if (!depotId) return

      try {
        const res = await routeExitRepairService.getStatsByDate(depotId, formattedDate, formattedDate)

        if (res.isSuccess && res.value) {
          const statsValue: RouteExitRepairStatsByDate = res.value
          const byConvoyRaw = statsValue.byConvoy
          const groupedArray: RouteExitRepairConvoyStat[] = Array.isArray(byConvoyRaw)
            ? byConvoyRaw
            : byConvoyRaw && typeof byConvoyRaw === "object"
              ? Object.values(byConvoyRaw)
              : []

          const aggregate = (type: RepairType): number => {
            switch (type) {
              case "Planned":
                return groupedArray.reduce((sum, item) => sum + (item.planned ?? 0), 0)
              case "Unscheduled":
                return groupedArray.reduce((sum, item) => sum + (item.unplanned ?? 0), 0)
              case "LongTerm":
                return groupedArray.reduce((sum, item) => sum + (item.long ?? 0), 0)
              case "Other":
                return groupedArray.reduce((sum, item) => sum + (item.other ?? 0), 0)
              default:
                return 0
            }
          }

          const fallbackPlanned = statsValue.totalPlanned ?? statsValue.total ?? 0
          const fallbackUnplanned = statsValue.totalUnplanned ?? 0
          const fallbackLong = statsValue.totalLong ?? 0
          const plannedTotal = groupedArray.length ? aggregate("Planned") : fallbackPlanned
          const unplannedTotal = groupedArray.length ? aggregate("Unscheduled") : fallbackUnplanned
          const longTotal = groupedArray.length ? aggregate("LongTerm") : fallbackLong

          setStats([
            {
              type: "Planned",
              title: "Плановый ремонт",
              value: plannedTotal,
              icon: <ClipboardList className="w-6 h-6 text-sky-700" />,
              bgColor: "bg-sky-100",
              href: "/dashboard/cts/repairs/plan",
            },
            {
              type: "Unscheduled",
              title: "Неплановый ремонт",
              value: unplannedTotal,
              icon: <Wrench className="w-6 h-6 text-amber-700" />,
              bgColor: "bg-amber-100",
              href: "/dashboard/cts/repairs/unscheduled-repairs",
            },
            {
              type: "LongTerm",
              title: "Длительный ремонт",
              value: longTotal,
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
        } else {
          setStats([
            {
              type: "Planned",
              title: "Плановый ремонт",
              value: 0,
              icon: <ClipboardList className="w-6 h-6 text-sky-700" />,
              bgColor: "bg-sky-100",
              href: "/dashboard/cts/repairs/plan",
            },
            {
              type: "Unscheduled",
              title: "Неплановый ремонт",
              value: 0,
              icon: <Wrench className="w-6 h-6 text-amber-700" />,
              bgColor: "bg-amber-100",
              href: "/dashboard/cts/repairs/unscheduled-repairs",
            },
            {
              type: "LongTerm",
              title: "Длительный ремонт",
              value: 0,
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
  }, [formattedDate])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-sky-800">Панель КТС</h1>
      <div className="flex flex-wrap items-center gap-3">
        {!loading && (
          <p className="text-gray-600 text-sm">
            На {formattedDate}: всего ремонтов — {totalRepairs}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Дата:</span>
          <Input
            type="date"
            value={formattedDate}
            onChange={(e) => {
              const val = e.target.value
              if (!val) return
              setSelectedDate(new Date(`${val}T00:00:00`))
            }}
            className="h-9 w-[170px]"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Загрузка статистики...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card
              key={stat.type}
              onClick={() => router.push(`${stat.href}?date=${formattedDate}`)}
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
