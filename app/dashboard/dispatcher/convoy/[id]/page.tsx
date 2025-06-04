"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { convoyService } from "@/service/convoyService"
import type { Convoy } from "@/types/convoy.types"
import { CalendarCheck2, FileText } from "lucide-react"
import { getDayType, formatDate } from "./release-plan/utils/dateUtils"
import { holidays } from "@/app/dashboard/fleet-manager/release-plan/data/holidays"
import { useConvoy } from "../../context/ConvoyContext"

export default function DispatcherConvoyPage() {
  const { id } = useParams()
  const router = useRouter()
  const convoyId = id as string

  const { setConvoyId } = useConvoy()
  const [convoy, setConvoy] = useState<Convoy | null>(null)

  const todayDate = new Date()
  const today = formatDate(todayDate)
  const dayType = getDayType(todayDate, holidays.map(h => new Date(h.date)))

  useEffect(() => {
    if (!convoyId) return

    setConvoyId(convoyId) // 🔄 сохраняем выбранную колонну в контекст

    const fetchConvoy = async () => {
      try {
        const res = await convoyService.getById(convoyId)
        setConvoy(res.value || null)
      } catch (err) {
        console.error("Ошибка загрузки колонны", err)
      }
    }

    fetchConvoy()
  }, [convoyId, setConvoyId])

  if (!convoy) return <div className="p-6 text-gray-600">Загрузка данных...</div>

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-sky-700">
        Управление автоколонной №{convoy.number}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* План выпуска */}
        <Card className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sky-700">
              <CalendarCheck2 className="w-5 h-5" />
              План выпуска
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600">Показать план выпуска на выбранную дату.</p>
            <Button
              className="w-full"
              onClick={() =>
                router.push(`/dashboard/dispatcher/convoy/${convoyId}/release-plan/${dayType}?date=${today}`)
              }
            >
              Перейти к плану выпуска
            </Button>
          </CardContent>
        </Card>

        {/* Ведомость */}
        <Card className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <FileText className="w-5 h-5" />
              Ведомость
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600">Посмотреть итоговую ведомость на текущую дату.</p>
            <Button
              className="w-full"
              onClick={() =>
                router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${today}/final-dispatch`)
              }
            >
              Перейти к ведомости
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
