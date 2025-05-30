"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Users, Bus, Map } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConvoySummaryCardProps {
  convoyNumber: number
  driverCount: number
  busCount: number
  routeCount: number
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
    <Card className="shadow-md hover:shadow-lg transition">
      <CardHeader>
        <CardTitle className="text-xl text-sky-700">Автоколонна №{convoyNumber}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-green-500" />
          <span>Водителей: {driverCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 text-blue-500" />
          <span>Автобусов: {busCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-amber-500" />
          <span>Маршрутов: {routeCount}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onManage} className="w-full">
          Управлять
        </Button>
      </CardFooter>
    </Card>
  )
}
