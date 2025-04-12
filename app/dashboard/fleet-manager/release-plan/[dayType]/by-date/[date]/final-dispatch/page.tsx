"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Printer, Download, FileText } from "lucide-react"
import Link from "next/link"
import { formatDateLabel, parseDate } from "../../../../utils/dateUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FinalDispatchData } from "../../../../types/finalDispatch"
import { getMockFinalDispatch } from "../../../mock/finalDispatchMock"
import FinalDispatchTable from "../../../../components/FinalDispatchTable"
import { routeService } from "@/app/api/apiService"

export default function FinalDispatchPage() {
  const params = useParams()
  const dateString = params.date as string
  const dayType = params.dayType as string

  // Memoize the date object to prevent recreation on each render
  const date = useMemo(() => parseDate(dateString), [dateString])

  const [dispatchData, setDispatchData] = useState<FinalDispatchData | null>(null)
  const [loading, setLoading] = useState(true)

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Получаем моковые данные
        const data = getMockFinalDispatch(date)

        // Пытаемся получить маршруты из API, но не блокируем работу, если API недоступен
        try {
          const routesResponse = await routeService.getAll()

          // Если API вернуло маршруты, можно использовать их для формирования разнарядки
          if (routesResponse.isSuccess && routesResponse.value) {
            console.log("Получены маршруты из API:", routesResponse.value.length)
            // В будущем здесь можно добавить логику для формирования разнарядки
            // на основе полученных маршрутов
          }
        } catch (apiError) {
          console.warn("API недоступен, используются моковые данные:", apiError)
          // Продолжаем работу с моковыми данными
        }

        // Устанавливаем данные и завершаем загрузку
        setDispatchData(data)
        setLoading(false)
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [date])

  // Обработчик печати
  const handlePrint = () => {
    window.print()
  }

  // Обработчик экспорта в PDF
  const handleExport = () => {
    // Здесь должна быть логика экспорта в PDF
    alert("Экспорт в PDF")
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/${dateString}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">Итоговая разнарядка</h1>
            <p className="text-gray-500 mt-1">{formatDateLabel(date)}</p>
          </div>
        </div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/${dateString}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">Итоговая разнарядка</h1>
          <p className="text-gray-500 mt-1">{formatDateLabel(date)}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="bg-blue-500 text-white flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              План выпуска автобусов
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-blue-600"
                onClick={handleExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Экспорт в PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-blue-600"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Печать
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">{dispatchData && <FinalDispatchTable data={dispatchData} />}</CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
