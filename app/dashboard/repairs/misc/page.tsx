"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns"
import { getAuthData } from "@/lib/auth-utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { DateRangePicker } from "./components/DateRangePicker"
import OtherRepairTable from "./components/OtherRepairTable"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export default function MiscRepairsPage() {
  const auth = getAuthData()
  const convoyId = auth?.convoyId ?? ""
  const depotId = auth?.busDepotId ?? ""

  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])
  const [from, setFrom] = useState<Date>(new Date())
  const [to, setTo] = useState<Date>(new Date())

  const fetchRepairs = async () => {
    if (!depotId) return
  
    const allDates: Date[] = []
    const current = new Date(from)
    while (current <= to) {
      allDates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
  
    const results: RouteExitRepairDto[] = []
  
    for (const date of allDates) {
      const dateStr = format(date, "yyyy-MM-dd")
      const res = await routeExitRepairService.getByDate(dateStr, depotId)
      if (res.isSuccess && res.value) {
        results.push(...res.value)
      }
    }
  
    const filtered = results.filter((r) =>
      r.convoy?.id === convoyId &&
      r.repairType === "Other"
    )
  
    setRepairs(filtered)
  }  

  useEffect(() => {
    fetchRepairs()
  }, [from, to])

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Прочий ремонт</h1>
      <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      <OtherRepairTable repairs={repairs} />
    </div>
  )
}
