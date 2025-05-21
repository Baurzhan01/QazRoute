//переходы в разделы
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users, CalendarDays, Bus, Route, FileBarChart } from "lucide-react"

export function QuickLinks() {
  const router = useRouter()

  const links = [
    {
      title: "Управление диспетчерами",
      icon: <Users className="h-5 w-5" />,
      path: "/dashboard/senior-dispatcher/dispatchers",
      description: "Управление персоналом диспетчерской службы",
    },
    {
      title: "Табель",
      icon: <CalendarDays className="h-5 w-5" />,
      path: "/dashboard/senior-dispatcher/shift-table",
      description: "Табель рабочего времени диспетчеров",
    },
    {
      title: "Расписание маршрутов",
      icon: <Route className="h-5 w-5" />,
      path: "/dashboard/senior-dispatcher/routes",
      description: "Управление расписанием маршрутов",
    },
    {
      title: "Плановые заявки",
      icon: <Bus className="h-5 w-5" />,
      path: "/dashboard/senior-dispatcher/routes/plan-orders",
      description: "Управление плановыми заявками на перевозки",
    },
    {
      title: "Отчеты",
      icon: <FileBarChart className="h-5 w-5" />,
      path: "/dashboard/senior-dispatcher/reports",
      description: "Просмотр и анализ отчетов",
    },
  ]

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {links.map((link, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50"
              onClick={() => router.push(link.path)}
            >
              <div className="p-2 bg-slate-100 rounded-full">{link.icon}</div>
              <div className="font-medium">{link.title}</div>
              <div className="text-xs text-slate-500 font-normal">{link.description}</div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
