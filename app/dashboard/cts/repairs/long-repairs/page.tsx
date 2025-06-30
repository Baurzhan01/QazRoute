"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { getAuthData } from "@/lib/auth-utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { toast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import LongRepairTable from "./LongRepairTable"
import { DateRangePicker } from "../../../repairs/misc/components/DateRangePicker"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export default function LongRepairPage() {
  const [from, setFrom] = useState<Date>(new Date())
  const [to, setTo] = useState<Date>(new Date())
  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])

  const auth = getAuthData()
  const depotId = auth?.busDepotId

  const loadData = async () => {
    if (!depotId) return
    const startDate = format(from, "yyyy-MM-dd")
    const endDate = format(to, "yyyy-MM-dd")
    const res = await routeExitRepairService.getStatsByDate(depotId, startDate, endDate)
    if (!res.isSuccess || !res.value) {
      toast({ title: "Ошибка", description: "Не удалось загрузить данные по ремонту", variant: "destructive" })
      return
    }

    // Загружаем все ремонты за период и фильтруем по типу
    const allRepairsRes = await routeExitRepairService.getByDate(startDate, depotId)
    if (allRepairsRes.isSuccess && allRepairsRes.value) {
      const filtered = allRepairsRes.value.filter((r) => r.repairType === "LongTerm")
      setRepairs(filtered)
    }
  }

  useEffect(() => {
    loadData()
  }, [from, to])

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Выбор периода</CardTitle>
        </CardHeader>
        <CardContent>
          <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Длительные ремонты</CardTitle>
        </CardHeader>
        <CardContent>
          <LongRepairTable repairs={repairs} />
        </CardContent>
      </Card>
    </div>
  )
}
