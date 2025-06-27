"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import { convoyService } from "@/service/convoyService"
import UnscheduledRepairTable from "./components/UnscheduledRepairTable"
import AssignUnplannedRepairModal from "./components/AssignUnplannedRepairModal"

export default function UnscheduledRepairsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [repairs, setRepairs] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const auth = getAuthData()
  const depotId = auth?.busDepotId

  const formattedDate = useMemo(
    () => format(selectedDate, "yyyy-MM-dd"),
    [selectedDate]
  )

  const fetchRepairs = useCallback(async () => {
    if (!depotId) {
      toast({ title: "Нет ID автобусного парка", variant: "destructive" })
      return
    }

    const res = await routeExitRepairService.getByDate(formattedDate, depotId)
    if (res.isSuccess && res.value) {
      setRepairs(res.value)
    } else {
      toast({ title: "Ошибка загрузки ремонтов", description: res.error, variant: "destructive" })
      setRepairs([])
    }
  }, [formattedDate, depotId])

  useEffect(() => {
    fetchRepairs()
  }, [fetchRepairs])

  return (
    <div className="p-6 space-y-6">
      {/* Выбор даты */}
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
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "PPP", { locale: ru })
                    : "Выберите дату"}
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
      </div>

      {/* Таблица ремонтов */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Неплановые ремонты</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Всего за {format(selectedDate, "dd.MM.yyyy")}: {repairs.length}
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>+ Добавить запись</Button>
        </CardHeader>
        <CardContent>
          <UnscheduledRepairTable repairs={repairs} onRefresh={fetchRepairs} />
        </CardContent>
      </Card>

      {/* Модальное окно */}
      {showAddModal && (
        <AssignUnplannedRepairModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          date={selectedDate}
          onSuccess={() => {
            setShowAddModal(false)
            fetchRepairs()
          }}
        />
      )}
    </div>
  )
}
