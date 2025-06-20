"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { convoyService } from "@/service/convoyService"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { getAuthData } from "@/lib/auth-utils"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import UnscheduledRepairTable from "./components/UnscheduledRepairTable"

export default function UnscheduledRepairsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [convoyStats, setConvoyStats] = useState<Record<string, number>>({})
  const [totalCount, setTotalCount] = useState<number>(0)
  const [repairs, setRepairs] = useState<any[]>([])
  const [convoyNames, setConvoyNames] = useState<Record<string, string>>({})
  const [showAddModal, setShowAddModal] = useState(false)

  const auth = getAuthData()
  const depotId = auth?.busDepotId
  const formattedDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate])

  const fetchStats = async () => {
    if (!depotId) return

    try {
      const res = await routeExitRepairService.getStatsByDate(depotId, formattedDate, formattedDate)
      if (res.isSuccess && typeof res.value === "object") {
        setTotalCount(res.value.total || 0)
        setConvoyStats(res.value.byConvoy || {})
      } else {
        toast({ title: "Не удалось получить статистику", variant: "destructive" })
      }
    } catch {
      toast({ title: "Ошибка при загрузке статистики", variant: "destructive" })
    }
  }

  const fetchRepairs = async () => {
    try {
      const res = await routeExitRepairService.getByDate(formattedDate)
      if (res.isSuccess && res.value) {
        setRepairs(res.value)
      } else {
        setRepairs([])
        toast({ title: "Не удалось загрузить данные ремонтов", variant: "destructive" })
      }
    } catch {
      toast({ title: "Ошибка загрузки данных", variant: "destructive" })
    }
  }

  const fetchConvoyNames = useCallback(async () => {
    if (!depotId) return
    try {
      const res = await convoyService.getByDepotId(depotId)
      if (res.isSuccess && res.value) {
        const map: Record<string, string> = {}
        res.value.forEach((c) => (map[c.id] = `Автоколонна №${c.number}`))
        setConvoyNames(map)
      }
    } catch {
      toast({ title: "Ошибка загрузки колонн", variant: "destructive" })
    }
  }, [depotId])

  useEffect(() => {
    fetchStats()
    fetchRepairs()
  }, [formattedDate])

  useEffect(() => {
    fetchConvoyNames()
  }, [fetchConvoyNames])

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Дата</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ru }) : "Выберите дату"}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика по неплановому ремонту</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Всего по автобусному парку: <strong>{totalCount}</strong>
            </p>
            {Object.entries(convoyStats).map(([convoyId, count]) => (
              <p key={convoyId} className="text-sm text-muted-foreground">
                {convoyNames[convoyId] || `Автоколонна ${convoyId}`}: <strong>{count}</strong>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-start">
          <div>
            <CardTitle>Неплановые ремонты</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Всего за {format(selectedDate, "dd.MM.yyyy")}: {totalCount}
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>+ Добавить запись</Button>
        </CardHeader>
        <CardContent>
          <UnscheduledRepairTable repairs={repairs} />
        </CardContent>
      </Card>

      {/* 👇 Здесь подключишь модалку добавления позже */}
      {/* {showAddModal && <AddUnscheduledRepairDialog onClose={() => setShowAddModal(false)} />} */}
    </div>
  )
}
