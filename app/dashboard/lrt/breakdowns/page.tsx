// ✅ 1. Страница /dashboard/lrt/breakdowns
"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAuthData } from "@/lib/auth-utils"
import { toast } from "@/components/ui/use-toast"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import LRTBreakdownTable from "./components/LRTBreakdownTable"

export default function LRTBreakdownsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [repairs, setRepairs] = useState<any[]>([])

  const depotId = getAuthData()?.busDepotId
  const formattedDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate])

  useEffect(() => {
    const fetch = async () => {
      if (!depotId) return
      const res = await routeExitRepairService.getByDate(formattedDate, depotId)
      if (res.isSuccess && res.value) {
        setRepairs(res.value.filter(r => r.repairType === "Unscheduled"))
      } else {
        toast({ title: "Ошибка загрузки данных", variant: "destructive" })
        setRepairs([])
      }
    }

    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [formattedDate, depotId])

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Дата</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}> 
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: ru }) : "Выберите дату"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => date && setSelectedDate(date)}
                locale={ru}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Неплановые ремонты</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Всего за {format(selectedDate, "dd.MM.yyyy")}: {repairs.length}
          </p>
        </CardHeader>
        <CardContent>
          <LRTBreakdownTable repairs={repairs} />
        </CardContent>
      </Card>
    </div>
  )
}