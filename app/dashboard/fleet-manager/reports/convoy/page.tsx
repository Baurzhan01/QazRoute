"use client"

import { useState } from "react"
import { format } from "date-fns"
import { DateRangePicker } from "../../../repairs/misc/components/DateRangePicker"  
import { getAuthData } from "@/lib/auth-utils" 
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { Button } from "@/components/ui/button"
import BusAutocompleteConvoyOnly from "./components/BusAutocompleteConvoyOnly"
import RepairHistoryTable from "./components/RepairHistoryTable"
import type { RouteExitRepairDto, BusRepairStatsResponse } from "@/types/routeExitRepair.types"

export default function ConvoyBusRepairReportPage() {
  const [fromDate, setFromDate] = useState(new Date())
  const [toDate, setToDate] = useState(new Date())
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null)
  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])
  const [stats, setStats] = useState<BusRepairStatsResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFetch = async () => {
    if (!selectedBusId) return
    setLoading(true)
    try {
      const res = await routeExitRepairService.getBusRepairStats(
        selectedBusId,
        format(fromDate, "yyyy-MM-dd"),
        format(toDate, "yyyy-MM-dd")
      )
      if (res.isSuccess && res.value) {
        setRepairs(res.value.history || [])
        setStats(res.value)
      } else {
        setRepairs([])
        setStats(null)
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
      setRepairs([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-sky-700">История ремонтов автобусов</h1>

      <div className="flex flex-wrap items-end gap-6">
        <DateRangePicker
          from={fromDate}
          to={toDate}
          onFromChange={setFromDate}
          onToChange={setToDate}
        />
        <BusAutocompleteConvoyOnly onSelect={(bus) => setSelectedBusId(bus.id)} />
        <Button onClick={handleFetch} disabled={!selectedBusId}>
          Показать
        </Button>
      </div>

      {stats && (
        <div className="bg-muted p-4 rounded-md text-sm space-y-1 border text-muted-foreground">
          <p>🔧 Всего ремонтов: <strong>{stats.totalRepairs}</strong></p>
          <p>📍 Неплановых: <strong>{stats.unscheduledCount}</strong></p>
          <p>🧯 Длительных: <strong>{stats.longTermCount}</strong></p>
          <p>📎 Прочие: <strong>{stats.otherCount}</strong></p>
          <p>⏱️ Общий простой: <strong>{stats.totalDowntimeHours.toFixed(1)} ч</strong></p>
          <p>🕒 Средняя длительность ремонта: <strong>{stats.averageRepairDurationHours.toFixed(1)} ч</strong></p>
        </div>
      )}

      <RepairHistoryTable repairs={repairs} loading={loading} />
    </div>
  )
}
