"use client"

import { useEffect, useState, useCallback } from "react"
import { format } from "date-fns"
import { getAuthData } from "@/lib/auth-utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { DateRangePicker } from "../repairs/misc/components/DateRangePicker"
import BreakdownTable from "./components/BreakdownTable"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export default function BreakdownsPage() {
  const auth = getAuthData()
  const depotId = auth?.busDepotId ?? ""
  const convoyId = auth?.convoyId ?? ""

  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])
  const [from, setFrom] = useState<Date>(new Date())
  const [to, setTo] = useState<Date>(new Date())

  const fetchAllRepairs = useCallback(async () => {
    if (!depotId) return

    const dateList: string[] = []
    const current = new Date(from)
    while (current <= to) {
      dateList.push(format(current, "yyyy-MM-dd"))
      current.setDate(current.getDate() + 1)
    }

    const all: RouteExitRepairDto[] = []
    for (const date of dateList) {
      const res = await routeExitRepairService.getByDate(date, depotId)
      if (res.isSuccess && res.value) {
        all.push(...res.value.filter((r) => r.repairType === "Unscheduled" && r.convoy?.id === convoyId))
      }
    }

    setRepairs(all)
  }, [depotId, convoyId, from, to])

  useEffect(() => {
    fetchAllRepairs()

    const interval = setInterval(() => {
      fetchAllRepairs()
    }, 10000) // каждые 10 секунд

    return () => clearInterval(interval)
  }, [fetchAllRepairs])

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Сходы с линии</h1>
      <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      <BreakdownTable repairs={repairs} />
    </div>
  )
}
