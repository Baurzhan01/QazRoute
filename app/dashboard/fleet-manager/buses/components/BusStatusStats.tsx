"use client"

import { motion } from "framer-motion"
import { Bus, Wrench, AlertTriangle, Clock, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { BusStatsData } from "@/types/bus.types"

interface BusStatusStatsProps {
  stats?: BusStatsData
  isLoading?: boolean
  selectedStatus: string | null
  onStatusSelect: (status: string | null) => void
}

export default function BusStatusStats({ stats, isLoading, selectedStatus, onStatusSelect }: BusStatusStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Всего автобусов",
      value: stats.total,
      icon: <Bus className="h-8 w-8 text-blue-500" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      status: null,
    },
    {
      title: "На линии",
      value: stats.OnWork,
      icon: <Bus className="h-8 w-8 text-green-500" />,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      status: "OnWork",
    },
    {
      title: "На ремонте",
      value: stats.UnderRepair,
      icon: <Wrench className="h-8 w-8 text-amber-500" />,
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      status: "UnderRepair",
    },
    {
      title: "Длительный ремонт",
      value: stats.LongTermRepair,
      icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      status: "LongTermRepair",
    },
    {
      title: "Выходной",
      value: stats.DayOff,
      icon: <Clock className="h-8 w-8 text-purple-500" />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      status: "DayOff",
    },
    {
      title: "Списан",
      value: stats.Decommissioned,
      icon: <XCircle className="h-8 w-8 text-gray-500" />,
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      status: "Decommissioned",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((card, index) => {
        const isSelected = selectedStatus === card.status

        return (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
            animate={{
              y: isSelected ? -5 : 0,
              boxShadow: isSelected
                ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            }}
            transition={{ duration: 0.3 }}
            onClick={() => onStatusSelect(card.status)}
            className="cursor-pointer"
          >
            <Card className={`${card.bgColor} border-none ${isSelected ? "ring-2 ring-offset-2" : ""}`}>
              <CardContent className="p-4 flex items-center space-x-4">
                <motion.div
                  className="p-2 rounded-full bg-white/80 shadow-sm"
                  animate={{ rotate: isSelected ? [0, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {card.icon}
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
