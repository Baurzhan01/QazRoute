"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { getAuthData } from "@/lib/auth-utils"
import { toast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import AssignOtherRepairModal from "./components/AssignOtherRepairModal"
import OtherRepairTable from "./components/OtherRepairTable"
import { DateRangePicker } from "../../../repairs/misc/components/DateRangePicker"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export default function OtherRepairsPage() {
  const [from, setFrom] = useState(new Date())
  const [to, setTo] = useState(new Date())
  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])
  const [showModal, setShowModal] = useState(false)

  const auth = getAuthData()
  const depotId = auth?.busDepotId

  const fetchRepairs = async () => {
    if (!depotId) return
    const startDate = format(from, "yyyy-MM-dd")
    const endDate = format(to, "yyyy-MM-dd")
    const res = await routeExitRepairService.getStatsByDate(depotId, startDate, endDate)

    if (!res.isSuccess || !res.value) {
      toast({ title: "Ошибка", description: "Не удалось загрузить прочие ремонты", variant: "destructive" })
      return
    }

    const allRepairs = await routeExitRepairService.getByDate(startDate, depotId)
    if (allRepairs.isSuccess && allRepairs.value) {
      const filtered = allRepairs.value.filter(r => r.repairType === "Other")
      setRepairs(filtered)
    } else {
      setRepairs([])
    }
  }


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

      <div className="flex justify-end">
        <Button onClick={() => setShowModal(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Добавить запись
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Прочий ремонт</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Всего: {repairs.length}
          </p>
        </CardHeader>
        <CardContent>
        <OtherRepairTable from={from} to={to} />
        </CardContent>
      </Card>

      <AssignOtherRepairModal
        open={showModal}
        onClose={() => setShowModal(false)}
        date={from}
        onSuccess={fetchRepairs}
      />
    </div>
  )
}
