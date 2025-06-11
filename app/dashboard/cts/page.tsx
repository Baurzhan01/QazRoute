"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, ClipboardList, Clock, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { repairService } from "@/service/repairService"

interface DashboardStat {
  title: string
  value: number
  icon: React.ReactNode
  bgColor: string
}

export default function CTSHomePage() {
  const [stats, setStats] = useState<DashboardStat[]>([])

  useEffect(() => {
    // Пример: вместо реального API можно пока подставить временные данные
    setStats([
      { title: "Плановый ремонт", value: 12, icon: <ClipboardList className="w-6 h-6" />, bgColor: "bg-sky-100" },
      { title: "Неплановый ремонт", value: 5, icon: <Wrench className="w-6 h-6" />, bgColor: "bg-amber-100" },
      { title: "Длительный ремонт", value: 3, icon: <Clock className="w-6 h-6" />, bgColor: "bg-rose-100" },
      { title: "Сообщения", value: 2, icon: <Bell className="w-6 h-6" />, bgColor: "bg-lime-100" },
    ])
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Главная — КТС</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className={cn(stat.bgColor, "shadow-md")}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
