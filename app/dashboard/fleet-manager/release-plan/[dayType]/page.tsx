"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Calendar, ArrowLeft, Eye, Bus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { routeService } from "@/app/api/apiService"
import RouteCard from "../components/RouteCard"
import type { Route } from "@/app/api/types"

// Валидные типы дня
type ValidDayType = "workday" | "saturday" | "sunday" | "holiday"

export default function DayTypeReleasePlanPage() {
  const params = useParams()
  const rawDayType = params.dayType as string
  const normalizedDayType = normalizeDayType(rawDayType)
  const today = new Date().toISOString().split("T")[0]

  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getDayTypeInfo = () => {
    switch (normalizedDayType) {
      case "workday":
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
          description: "Управление выпуском автобусов на маршруты в воскресенье",
          color: "text-green-600",
        }
      case "holiday":
        return {
          title: "План выпуска (Праздничные дни)",
          description: "Управление автобусами в праздничные дни",
          color: "text-purple-600",
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
          throw new Error(response.error || "Не удалось получить маршруты")
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Произошла ошибка при загрузке маршрутов"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchRoutes()
  }, [])

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
            <h1 className={`text-2xl md:text-3xl font-bold ${dayTypeInfo.color}`}>
              {dayTypeInfo.title}
            </h1>
            <p className="text-gray-500 mt-1">{dayTypeInfo.description}</p>
          </div>
        </div>
        <Link href={`/dashboard/fleet-manager/release-plan/${normalizedDayType}/schedule`}>
          <Button className="bg-sky-500 hover:bg-sky-600">
            <Eye className="mr-2 h-4 w-4" />
            Посмотреть итоговый план
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
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        ) : routes.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {routes.map((route: Route, index: number) =>
              route.id ? (
                <RouteCard
                  key={route.id}
                  id={route.id}
                  number={route.number}
                  order={index + 1}
                  date={today}
                  dayType={normalizedDayType}
                />
              ) : null
            )}
          </motion.div>
        ) : (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              <Bus className="mx-auto mb-2 h-10 w-10 text-gray-400" />
              Маршруты не найдены
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// 🔧 Нормализация dayType
function normalizeDayType(value: string): ValidDayType {
  switch (value.toLowerCase()) {
    case "workdays":
    case "workday":
      return "workday"
    case "saturday":
      return "saturday"
    case "sunday":
      return "sunday"
    case "holiday":
      return "holiday"
    default:
      return "workday"
  }
}
