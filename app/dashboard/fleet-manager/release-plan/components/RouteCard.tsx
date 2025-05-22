"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bus, ArrowRight } from "lucide-react"
import { getAuthData } from "@/lib/auth-utils"
import { releasePlanService } from "@/service/releasePlanService"
import { toast } from "@/components/ui/use-toast"

type DayType = "workday" | "saturday" | "sunday" | "holiday"

interface RouteCardProps {
  id: string
  number: string
  order: number
  date: string // формат YYYY-MM-DD
  dayType: DayType
  delay?: number
}

export default function RouteCard({
  id,
  number,
  order,
  date,
  dayType,
  delay = 0,
}: RouteCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const auth = getAuthData()

    if (!auth?.convoyId) {
      toast({
        title: "Ошибка",
        description: "Не удалось определить колонну",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const check = await releasePlanService.getRouteDetails(id, date)

      // Если разнарядка по маршруту отсутствует — инициализируем разнарядку по всей колонне
      if (!check.isSuccess || !check.value) {
        await releasePlanService.createDispatchRoute(auth.convoyId, date) // ✅ исправлено: передаём 2 аргумента
      }

      router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/route/${id}`)
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить или создать разнарядку",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
        <div className="absolute top-2 left-2 w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold rounded-md">
          {order}
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
