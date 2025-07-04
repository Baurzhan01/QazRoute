"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ConvoyReportsPage() {
  const router = useRouter()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">📊 Отчёты по ремонтам</h1>
      <p className="text-gray-600">Выберите тип отчёта</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Card className="hover:shadow-md transition cursor-pointer">
        <CardContent className="p-4 space-y-4">
          <CardTitle className="text-lg font-semibold">📋 Все ремонты автобусов</CardTitle>
          <p className="text-gray-500 text-sm">
            Получить полную историю ремонтов по автобусам вашей колонны с фильтрацией по дате и экспортом в Excel
          </p>
          <Button onClick={() => router.push("/dashboard/fleet-manager/reports/all-repairs")}>
            Открыть отчёт
          </Button>
        </CardContent>
      </Card>
        <Card className="hover:shadow-md transition cursor-pointer">
          <CardContent className="p-4 space-y-4">
            <CardTitle className="text-lg font-semibold">🚌 История по автобусу</CardTitle>
            <p className="text-gray-500 text-sm">
              Посмотреть историю ремонтов конкретного автобуса вашей колонны
            </p>
            <Button onClick={() => router.push("/dashboard/fleet-manager/reports/convoy")}>
              Перейти к отчёту
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
