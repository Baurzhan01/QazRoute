"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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

type ConvoyRepairStat = {
  planned: number
  unplanned: number
  long: number
  other: number
}

export default function UnscheduledRepairsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [repairs, setRepairs] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [convoyStats, setConvoyStats] = useState<Record<string, ConvoyRepairStat>>({})
  const [convoyNames, setConvoyNames] = useState<Record<string, string>>({})
  const [showAddModal, setShowAddModal] = useState(false)

  const auth = getAuthData()
  const depotId = auth?.busDepotId
  const formattedDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate])

  const fetchRepairs = async () => {
    if (!depotId) return
    const res = await routeExitRepairService.getByDate(formattedDate, depotId)
    if (res.isSuccess && res.value) {
      setRepairs(res.value)
    } else {
      toast({ title: "Ошибка загрузки ремонтов", variant: "destructive" })
      setRepairs([])
    }
  }
  

  const fetchConvoyNames = useCallback(async () => {
    if (!depotId) return
    const res = await convoyService.getByDepotId(depotId)
    if (res.isSuccess && res.value) {
      const map: Record<string, string> = {}
      res.value.forEach((c) => {
        map[c.id] = `Автоколонна №${c.number}`
      })
      setConvoyNames(map)
    }
  }, [depotId])

  const reloadAll = () => {
    fetchRepairs()
    // fetchStats()
  }

  useEffect(() => {
    reloadAll()
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
        <CardHeader className="flex justify-between items-start">
          <div>
            <CardTitle>Неплановые ремонты</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Всего за {format(selectedDate, "dd.MM.yyyy")}: {repairs.length}
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>+ Добавить запись</Button>
        </CardHeader>
        <CardContent>
          <UnscheduledRepairTable repairs={repairs} onRefresh={reloadAll} />
        </CardContent>
      </Card>

      {showAddModal && (
        <AssignUnplannedRepairModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          date={selectedDate}
          onSuccess={() => {
            setShowAddModal(false)
            reloadAll()
          }}
        />
      )}
    </div>
  )
}
