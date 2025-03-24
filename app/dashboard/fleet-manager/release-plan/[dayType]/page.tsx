"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Bus, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import { routeService } from "@/app/api/apiService"
import type { Route } from "@/app/api/types"
import RouteCard from "../components/RouteCard"

export default function DayTypeReleasePlanPage() {
  const params = useParams()
  const dayType = params.dayType as string

  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Получаем заголовок и описание в зависимости от типа дня
  const getDayTypeInfo = () => {
    switch (dayType) {
      case "workdays":
        return {
          title: "План выпуска (Будни)",
          description: "Управление выпуском автобусов на маршруты в будние дни",
          color: "text-sky-700",
        }
      case "saturday":
        return {
          title: "План выпуска (Суббота)",
          description: "Управление выпуском автобусов на маршруты в субботу",
          color: "text-amber-600",
        }
      case "sunday":
        return {
          title: "План выпуска (Воскресенье)",
          description: "Управление выпуском автобусов на маршруты в воскресенье и праздничные дни",
          color: "text-green-600",
        }
      default:
        return {
          title: "План выпуска",
          description: "Управление выпуском автобусов на маршруты",
          color: "text-sky-700",
        }
    }
  }

  const dayTypeInfo = getDayTypeInfo()

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true)
        const response = await routeService.getAll()

        if (response.isSuccess && response.value) {
          setRoutes(response.value)
        } else {
          throw new Error(response.error || "Не удалось получить данные о маршрутах")
        }
      } catch (err) {
        console.error("Ошибка при получении маршрутов:", err)
        setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке маршрутов")
      } finally {
        setLoading(false)
      }
    }

    fetchRoutes()
  }, [])

  // Анимация для контейнера
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/fleet-manager/release-plan">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${dayTypeInfo.color}`}>
              {dayTypeInfo.title}
            </h1>
            <p className="text-gray-500 mt-1">{dayTypeInfo.description}</p>
          </div>
        </div>
        <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/schedule`}>
          <Button className="bg-sky-500 hover:bg-sky-600">
            <Eye className="mr-2 h-4 w-4" />
            Посмотреть итоговый план выпуска
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-sky-500 mr-2" />
          <h2 className="text-xl font-semibold">Маршруты</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-lg bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700">{error}</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {routes.length > 0 ? (
              routes.map((route, index) => (
                <RouteCard key={route.id} route={route} orderNumber={index + 1} dayType={dayType} />
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Bus className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Нет доступных маршрутов</h3>
                <p className="text-gray-500 mb-4">Маршруты не найдены в системе.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

