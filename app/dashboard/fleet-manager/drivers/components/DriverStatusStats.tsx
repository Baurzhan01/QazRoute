"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { DriverStatus, DriverStatusCount } from "@/types/driver.types"
import {
  Activity,
  Calendar,
  UserCheck,
  UserMinus,
  Briefcase,
  UserX,
  Users,
} from "lucide-react"

interface DriverStatusStatsProps {
  statusCounts?: DriverStatusCount
  onStatusClick: (status: DriverStatus | null) => void
  selectedStatus: DriverStatus | null
  inReserve: boolean
}

export default function DriverStatusStats({
  statusCounts = {
    OnWork: 0,
    DayOff: 0,
    OnVacation: 0,
    OnSickLeave: 0,
    Intern: 0,
    Fired: 0,
    total: 0,
  },
  onStatusClick,
  selectedStatus,
  inReserve,
}: DriverStatusStatsProps) {
  const stats = [
    {
      id: null,
      label: "Всего",
      count: statusCounts.total,
      icon: Users,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
    },
    {
      id: "OnWork" as DriverStatus,
      label: "На работе",
      count: statusCounts.OnWork,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      id: "OnSickLeave" as DriverStatus,
      label: "На больничном",
      count: statusCounts.OnSickLeave,
      icon: Activity,
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
    {
      id: "OnVacation" as DriverStatus,
      label: "В отпуске",
      count: statusCounts.OnVacation,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      id: "Intern" as DriverStatus,
      label: "На обучении",
      count: statusCounts.Intern,
      icon: Briefcase,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      id: "Fired" as DriverStatus,
      label: "Отстранены",
      count: statusCounts.Fired,
      icon: UserX,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
    {
      id: "DayOff" as DriverStatus,
      label: "Выходной",
      count: statusCounts.DayOff,
      icon: UserMinus,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`cursor-pointer transition-all ${
            selectedStatus === stat.id
              ? "ring-2 ring-amber-500 shadow-md"
              : "hover:shadow-md"
          }`}
          onClick={() => onStatusClick(stat.id)}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <div className={`p-2 rounded-full ${stat.bgColor} mb-2`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="text-xl font-bold">{stat.count}</div>
            <div className="text-xs text-gray-500 text-center">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
