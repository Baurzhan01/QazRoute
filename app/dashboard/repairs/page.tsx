"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wrench, AlertTriangle, Hammer, Timer } from "lucide-react"
import { useRouter } from "next/navigation"

const repairCards = [
  {
    code: "PR",
    title: "Плановый ремонт",
    icon: <Wrench className="h-8 w-8 text-green-600" />,
    gradient: "from-green-400 to-green-600",
    description: "Регулярное техобслуживание: ТО, замена деталей, профилактика.",
    link: "/dashboard/repairs/planned",
  },
  {
    code: "НР",
    title: "Неплановый ремонт",
    icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
    gradient: "from-red-400 to-red-600",
    description: "Срочный ремонт после поломки или внештатной ситуации.",
    link: "/dashboard/repairs/unplanned",
  },
  {
    code: "ПР",
    title: "Прочий ремонт",
    icon: <Hammer className="h-8 w-8 text-yellow-600" />,
    gradient: "from-yellow-400 to-yellow-600",
    description: "Электрика, салон, освещение, безопасность и т.д.",
    link: "/dashboard/repairs/misc",
  },
  {
    code: "ДР",
    title: "Длительный ремонт",
    icon: <Timer className="h-8 w-8 text-blue-600" />,
    gradient: "from-blue-400 to-blue-600",
    description: "Капремонт, кузовные работы, переоборудование.",
    link: "/dashboard/repairs/longterm",
  },
]

export default function RepairJournal() {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {repairCards.map((card) => (
        <Card
          key={card.code}
          className="cursor-pointer transition-transform hover:scale-[1.02] shadow-md"
          onClick={() => router.push(card.link)}
        >
          <CardHeader className={`text-white bg-gradient-to-r ${card.gradient} rounded-t-md`}>
            <div className="flex items-center justify-between">
              <CardTitle>{card.title}</CardTitle>
              {card.icon}
            </div>
            <CardDescription className="text-white/80">{card.code}</CardDescription>
          </CardHeader>
          <div className="p-4 text-sm text-gray-700">{card.description}</div>
        </Card>
      ))}
    </div>
  )
}
