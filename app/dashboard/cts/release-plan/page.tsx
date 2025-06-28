"use client"

import { useEffect, useMemo, useState } from "react"
import { getAuthData } from "@/lib/auth-utils"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import { useFinalDispatch } from "@/app/dashboard/fleet-manager/release-plan/hooks/useFinalDispatch"
import FinalDispatchTable from "@/app/dashboard/fleet-manager/release-plan/components/FinalDispatchTable"
import { convoyService } from "@/service/convoyService"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { getDayTypeFromDate } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/dateUtils"
import type { ValidDayType } from "@/types/releasePlanTypes"

export default function CtsReleasePlanPage() {
  const auth = getAuthData()
  const depotId = auth?.busDepotId
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [activeConvoyId, setActiveConvoyId] = useState<string | null>(null)

  const { data: convoys = [] } = useQuery({
    queryKey: ["cts-convoys", depotId],
    enabled: !!depotId,
    queryFn: () => convoyService.getByDepotId(depotId!),
    select: (res) => res.value ?? [],
  })

  useEffect(() => {
    if (convoys.length > 0 && !activeConvoyId) {
      setActiveConvoyId(convoys[0].id)
    }
  }, [convoys])

  const dayType: ValidDayType = useMemo(() => {
    if (!selectedDate) return "workday"
    const localDateStr = format(selectedDate, "yyyy-MM-dd") // ✅ локальная дата
    return getDayTypeFromDate(localDateStr)
  }, [selectedDate])
    
  const {
    finalDispatch,
    convoySummary,
    driversCount,
    busesCount,
    loading,
    orderAssignments,
  } = useFinalDispatch(selectedDate, dayType, activeConvoyId ?? "")

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Разнарядка по колоннам</h1>

      <div className="w-[280px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "dd.MM.yyyy") : <span>Выберите дату</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate ?? undefined}
              onSelect={(date) => setSelectedDate(date ?? null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p className="mt-2 text-sm text-muted-foreground">
          {dayType === "workday" && "Будний день"}
          {dayType === "saturday" && "Суббота"}
          {dayType === "sunday" && "Воскресенье"}
          {dayType === "holiday" && "Праздничный день"}
        </p>
      </div>

      <div className="flex-1">
        <Tabs value={activeConvoyId ?? ""} onValueChange={setActiveConvoyId}>
          <TabsList className="flex flex-wrap gap-2 mt-4">
            {convoys.map((convoy) => (
              <TabsTrigger key={convoy.id} value={convoy.id}>
                Колонна №{convoy.number}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            {convoys.map((convoy) => (
              <TabsContent key={convoy.id} value={convoy.id}>
                {convoy.id === activeConvoyId && (
                  loading ? (
                    <p className="text-gray-500">Загрузка данных...</p>
                  ) : finalDispatch ? (
                    <FinalDispatchTable
                      data={finalDispatch}
                      depotNumber={convoy.number}
                      convoyId={convoy.id}
                      driversCount={driversCount}
                      busesCount={busesCount}
                      convoySummary={convoySummary}
                      dayType={dayType}
                      readOnlyMode
                      disableLinks={true}
                      orderAssignments={orderAssignments}
                    />
                  ) : (
                    <p className="text-gray-500">Нет данных</p>
                  )
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
