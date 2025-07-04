// app/dashboard/dispatcher/maintenance-plan/page.tsx

"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { addDays, format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getAuthData } from "@/lib/auth-utils"
import { convoyService } from "@/service/convoyService"
import { repairService } from "@/service/repairService"
import { busDepotService } from "@/service/busDepotService"
import { toast } from "@/components/ui/use-toast"
import RepairTableAllNoActions from "./components/RepairTableAllNoActions"
import type { FlatRepairRecord } from "@/types/repair.types"

export default function DispatcherMaintenancePlanPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [convoys, setConvoys] = useState<{ id: string; number: number }[]>([])
  const [repairsByConvoyId, setRepairsByConvoyId] = useState<Record<string, FlatRepairRecord[]>>({})
  const [loading, setLoading] = useState(false)
  const [depotName, setDepotName] = useState<string>("")

  const auth = getAuthData()
  const depotId = auth?.busDepotId || ""
  const formattedDate = useMemo(() => format(date, "yyyy-MM-dd"), [date])

  const handleError = (msg: string, err?: any) => {
    console.error(msg, err)
    toast({ title: "Ошибка", description: msg, variant: "destructive" })
  }

  const fetchData = useCallback(async () => {
    if (!depotId) return handleError("Не удалось определить депо")
    setLoading(true)
    try {
      const [depotRes, convoysRes, repairsRes] = await Promise.all([
        busDepotService.getById(depotId),
        convoyService.getByDepotId(depotId),
        repairService.getRepairsByDepotAndDate(formattedDate, depotId),
      ])

      if (!depotRes.isSuccess || !depotRes.value) throw new Error("Ошибка депо")
      setDepotName(depotRes.value.name)

      if (!convoysRes.isSuccess) throw new Error("Ошибка загрузки колонн")
      setConvoys((convoysRes.value ?? []).map(c => ({ id: c.id, number: c.number })))

      if (!repairsRes.isSuccess || !Array.isArray(repairsRes.value)) {
        throw new Error("Ошибка загрузки ремонтов")
      }

      const grouped: Record<string, FlatRepairRecord[]> = {}
      for (const r of repairsRes.value) {
        if (!r?.convoyId || !r?.bus || !r?.driver) continue
        if (!grouped[r.convoyId]) grouped[r.convoyId] = []
        grouped[r.convoyId].push(r)
      }
      setRepairsByConvoyId(grouped)
    } catch (e) {
      handleError("Не удалось загрузить данные", e)
    } finally {
      setLoading(false)
    }
  }, [formattedDate, depotId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{depotName || "Автобусный парк"}</h1>
      <p className="text-gray-600">Плановые ремонты на {formattedDate}:</p>

      {loading && <p className="text-gray-500">Загрузка...</p>}

      <div className="max-w-[260px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              locale={ru}
              fromDate={addDays(new Date(), -5)}
              toDate={addDays(new Date(), 5)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <RepairTableAllNoActions
        data={Object.entries(repairsByConvoyId).map(([convoyId, repairs]) => {
          const convoy = convoys.find(c => c.id === convoyId)
          return {
            convoyId,
            convoyNumber: convoy?.number ?? 0,
            repairs,
          }
        })}
        date={formattedDate}
      />
    </div>
  )
}
