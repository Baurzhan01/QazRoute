"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAuthData } from "@/lib/auth-utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { RouteExitRepairDto } from "@/types/routeExitRepair.types"
import UnscheduledRepairTable from "./components/UnscheduledRepairTable"

export default function DeparturesDropPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])

  const formattedDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate])
  const auth = getAuthData()
  const depotId = auth?.busDepotId

  const fetchRepairs = async () => {
    if (!depotId) return
    const res = await routeExitRepairService.getByDate(formattedDate, depotId)
    if (res.isSuccess && res.value) {
      setRepairs(res.value.filter((r: RouteExitRepairDto) => r.repairType === "Unscheduled"))
    } else {
      setRepairs([])
    }
  }

  useEffect(() => {
    fetchRepairs()

    const interval = setInterval(() => {
      fetchRepairs()
    }, 5000)

    return () => clearInterval(interval)
  }, [formattedDate, depotId])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🛠 Журнал сходов</h1>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "PPP", { locale: ru })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ru}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список сходов</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Всего: {repairs.length} на {format(selectedDate, "dd.MM.yyyy")}
          </p>
        </CardHeader>
        <CardContent>
          <UnscheduledRepairTable repairs={repairs} />
        </CardContent>
      </Card>
    </div>
  )
}
