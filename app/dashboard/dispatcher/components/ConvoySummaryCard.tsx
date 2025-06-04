"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Users, Bus, Map } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConvoySummaryCardProps {
  convoyNumber: number
  driverCount: number
  busCount: number
  routeCount: number // ← обязателен
  onManage: () => void
}


export default function ConvoySummaryCard({
  convoyNumber,
  driverCount,
  busCount,
  routeCount,
  onManage
}: ConvoySummaryCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-sky-800">
          Автоколонна №{convoyNumber}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Сводная информация</p>
      </CardHeader>

      <CardContent className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="h-4 w-4 text-green-600" />
          <span>Водителей: {driverCount}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Bus className="h-4 w-4 text-blue-600" />
          <span>Автобусов: {busCount}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Map className="h-4 w-4 text-yellow-600" />
          <span>Маршрутов: {routeCount}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onManage} className="w-full" variant="default">
          Управлять
        </Button>
      </CardFooter>
    </Card>
  )
}
