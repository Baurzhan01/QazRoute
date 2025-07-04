"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, Download, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { getAuthData } from "@/lib/auth-utils"
import { dutyService } from "@/service/dutyService"
import { toast } from "@/components/ui/use-toast"
import { exportDutyExcel } from "./utils/exportDutyExcel"
import DutyTable from "./components/DutyTable"
import { DispatchDutyRecord } from "@/types/releasePlanTypes"

export default function DutyPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [assignments, setAssignments] = useState<DispatchDutyRecord[]>([])
  const [loading, setLoading] = useState(false)

  const formattedDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate])
  const depotId = getAuthData()?.busDepotId

  const handleFetch = async () => {
    if (!depotId) {
      toast({ title: "Ошибка", description: "ID автобусного парка не найден" })
      return
    }

    setLoading(true)
    const res = await dutyService.getByDepotAndDate(depotId, formattedDate)

    if (res.isSuccess && res.value) {
      const flattened: DispatchDutyRecord[] = res.value.flatMap(route =>
        route.exits.map(exit => ({
          routeNumber: route.routeNumber,
          busLineNumber: exit.exitNumber,
          govNumber: exit.govNumber,
          garageNumber: exit.garageNumber,
          vinCode: exit.vinCode,
          busBrand: exit.brand,
          driverFullName: exit.driverFullName,
          driverServiceNumber: exit.driverServiceNumber || "",
        }))
      )
      setAssignments(flattened)
    } else {
      toast({ title: "Ошибка", description: res.error || "Не удалось загрузить данные" })
      setAssignments([])
    }

    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">📋 Дьюти (Общая разнарядка)</h1>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
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

          <Button onClick={handleFetch} disabled={loading}>
            {loading && <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />}
            Получить разнарядку
          </Button>
        </div>
      </div>

      {assignments.length > 0 && (
        <Card>
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle>Разнарядка на {format(selectedDate, "dd.MM.yyyy")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Всего: {assignments.length}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => exportDutyExcel(assignments, formattedDate)}
            >
              <Download className="w-4 h-4 mr-2" />
              Экспорт в Excel
            </Button>
          </CardHeader>
          <CardContent>
            <DutyTable data={assignments} date={formattedDate} loading={loading} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
