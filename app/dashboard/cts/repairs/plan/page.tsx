"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { addDays, format } from "date-fns"
import { ru } from "date-fns/locale"
import { getAuthData } from "@/lib/auth-utils"
import { convoyService } from "@/service/convoyService"
import { repairService } from "@/service/repairService"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { busDepotService } from "@/service/busDepotService"
import { toast } from "@/components/ui/use-toast"
import RepairTableAll from "./components/RepairTableAll"
import RepairTableSingle from "./components/RepairTableSingle"
import EditRepairDialog from "./components/EditRepairDialog"
import type { FlatRepairRecord, GroupedRepairsByConvoy } from "@/types/repair.types"

interface RepairStats {
  totalPlanned: number
  totalUnplanned: number
  totalLong: number
  totalOther: number
  byConvoy?: any
}

export default function CTSPlanRepairPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [mode, setMode] = useState<string>("all")
  const [convoys, setConvoys] = useState<{ id: string; number: number }[]>([])
  const [repairsByConvoyId, setRepairsByConvoyId] = useState<Record<string, FlatRepairRecord[]>>({})
  const [singleConvoyRepairs, setSingleConvoyRepairs] = useState<FlatRepairRecord[]>([])
  const [editRecord, setEditRecord] = useState<FlatRepairRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [depotName, setDepotName] = useState<string>("")
  const [repairStats, setRepairStats] = useState<RepairStats | null>(null)

  const auth = getAuthData()
  const depotId = auth?.busDepotId || ""
  const formattedDate = useMemo(() => format(date, "yyyy-MM-dd"), [date])

  const handleError = (msg: string, err?: any) => {
    console.error(msg, err)
    toast({ title: "Ошибка", description: msg, variant: "destructive" })
  }

  const fetchAll = useCallback(async () => {
    if (!depotId) return handleError("Не удалось определить депо")
    setLoading(true)
    try {
      const [depotRes, statsRes, convoysRes, repairsRes] = await Promise.all([
        busDepotService.getById(depotId),
        routeExitRepairService.getStatsByDate(depotId, formattedDate, formattedDate),
        convoyService.getByDepotId(depotId),
        repairService.getRepairsByDepotAndDate(formattedDate, depotId),
      ])

      if (!depotRes.isSuccess || !depotRes.value) throw new Error("Ошибка депо")
      setDepotName(depotRes.value.name)

      if (statsRes.isSuccess && typeof statsRes.value === "object") {
        setRepairStats(statsRes.value)
      } else {
        setRepairStats(null)
      }

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

  const fetchSingleConvoyRepairs = useCallback(async (convoyId: string) => {
    setLoading(true)
    try {
      const repairsRes = await repairService.getRepairsByDate(formattedDate, convoyId)
      if (!repairsRes.isSuccess) throw new Error()
      const repairs = repairsRes.value ?? []
      setSingleConvoyRepairs(repairs)
    } catch (e) {
      handleError("Не удалось загрузить ремонты колонны", e)
    } finally {
      setLoading(false)
    }
  }, [formattedDate])

  useEffect(() => {
    if (mode === "all") {
      fetchAll()
    } else if (mode !== "") {
      fetchSingleConvoyRepairs(mode)
    }
  }, [mode, formattedDate])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{depotName || "Автобусный парк"}</h1>
      <p className="text-gray-600">На {formattedDate}:</p>
      {repairStats && (
        <div className="text-sm text-gray-700 space-y-1">
          <p>Всего плановых ремонтов: {repairStats.totalPlanned ?? 0}</p>
        </div>
      )}

      {loading && <p className="text-gray-500">Загрузка...</p>}

      <Card className="p-2 w-fit">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && setDate(d)}
          locale={ru}
          fromDate={addDays(new Date(), -5)}
          toDate={addDays(new Date(), 5)}
        />
      </Card>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">Все автоколонны</TabsTrigger>
          {convoys.map(c => (
            <TabsTrigger key={c.id} value={c.id}>Автоколонна №{c.number}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="all">
            {Object.keys(repairsByConvoyId).length > 0 ? (
              <RepairTableAll
                data={Object.entries(repairsByConvoyId).map(([convoyId, repairs]) => {
                  const convoy = convoys.find(c => c.id === convoyId)
                  return {
                    convoyId,
                    convoyNumber: convoy?.number ?? 0,
                    repairs,
                  }
                })}
                date={formattedDate}
                onReload={fetchAll}
                onEdit={setEditRecord}
              />
            ) : (
              <p className="text-gray-500">Нет назначений на плановый ремонт</p>
            )}
          </TabsContent>

          {convoys.map(c => (
            <TabsContent key={c.id} value={c.id}>
              {singleConvoyRepairs.length > 0 ? (
                <RepairTableSingle
                  convoyId={c.id}
                  date={formattedDate}
                  convoyNumber={c.number}
                  repairs={singleConvoyRepairs}
                  onReload={() => fetchSingleConvoyRepairs(c.id)}
                  onEdit={setEditRecord}
                  onUpdate={async () => {}}
                />
              ) : (
                <p className="text-gray-500">Нет назначений на плановый ремонт</p>
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {editRecord && (
        <EditRepairDialog
          open={true}
          onClose={() => setEditRecord(null)}
          date={formattedDate}
          repair={editRecord}
          onUpdated={async () => {
            await fetchAll()
            if (mode !== "all") await fetchSingleConvoyRepairs(mode)
            setEditRecord(null)
          }}
        />
      )}
    </div>
  )
}
