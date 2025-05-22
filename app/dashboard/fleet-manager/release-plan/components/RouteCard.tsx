"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bus, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"

type DayType = "workday" | "saturday" | "sunday" | "holiday"

interface RouteCardProps {
  id: string
  number: string
  order: number
  date: string
  dayType: DayType
  delay?: number
  isAssigned?: boolean
}

export default function RouteCard({
  id,
  number,
  order,
  date,
  dayType,
  delay = 0,
  isAssigned = false,
}: RouteCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    setLoading(true)
    router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/route/${id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col relative overflow-hidden">
        {/* Порядковый номер */}
        <div className="absolute top-2 left-2 w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold rounded-md">
          {order}
        </div>

        {/* Статус назначения */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
          style={{
            backgroundColor: isAssigned ? "#dcfce7" : "#fef2f2",
            color: isAssigned ? "#166534" : "#991b1b",
          }}
        >
          {isAssigned ? (
            <>
              <CheckCircle className="w-4 h-4" /> Назначен
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" /> Не назначен
            </>
          )}
        </div>

        <CardContent className="flex flex-col items-center justify-center p-6 pt-12 flex-grow text-center">
          <div className="rounded-full bg-blue-100 p-4 mb-4">
            <Bus className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-4xl font-bold mb-1">№ {number}</h3>
          <p className="text-sm uppercase font-medium tracking-wide text-gray-500">маршрут</p>
        </CardContent>

        <CardFooter className="border-t p-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={handleClick}
            disabled={loading}
          >
            <span>Детали маршрута</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
