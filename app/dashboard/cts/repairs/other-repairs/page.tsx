"use client"

import { useEffect, useState, useMemo } from "react"
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
import OtherRepairTable from "./components/OtherRepairTable"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export default function OtherRepairsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])
  const [loading, setLoading] = useState(false)

  const auth = getAuthData()
  const depotId = auth?.busDepotId
  const formattedDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate])

  const fetchRepairs = async () => {
    if (!depotId) return
    setLoading(true)
    const res = await routeExitRepairService.getByDate(formattedDate, depotId)
    setLoading(false)

    if (res.isSuccess && res.value) {
      const filtered = res.value.filter(r => r.repairType === "Other")
      setRepairs(filtered)
    } else {
      toast({ title: "Ошибка при загрузке прочих ремонтов", variant: "destructive" })
      setRepairs([])
    }
  }

  useEffect(() => {
    fetchRepairs()
  }, [formattedDate])

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

      <Card>
        <CardHeader>
          <CardTitle>Прочий ремонт</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Всего за {format(selectedDate, "dd.MM.yyyy")}: {repairs.length}
          </p>
        </CardHeader>
        <CardContent>
          <OtherRepairTable repairs={repairs} onRefresh={fetchRepairs} />
        </CardContent>
      </Card>
    </div>
  )
}
