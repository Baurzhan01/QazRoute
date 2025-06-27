"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { getAuthData } from "@/lib/auth-utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { Button } from "@/components/ui/button"
import { SingleDatePicker } from "./components/SingleDatePicker"
import { downloadAsExcel } from "@/lib/excel-export"
import ConvoyUnplannedRepairTable from "./ConvoyUnplannedRepairTable"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export default function UnplannedRepairsPage() {
  const auth = getAuthData()
  const convoyId = auth?.convoyId ?? ""
  const depotId = auth?.busDepotId ?? ""

  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const fetchRepairs = async () => {
    const date = format(selectedDate, "yyyy-MM-dd")
    const res = await routeExitRepairService.getByDate(date, depotId)
    if (res.isSuccess && res.value) {
      const list = res.value.filter(r => r.convoy?.id === convoyId && r.repairType === "Unscheduled")
      setRepairs(list)
    } else {
      setRepairs([])
    }
  }

  useEffect(() => {
    fetchRepairs()
  }, [selectedDate])

  const handleExport = () => {
    const rows = repairs.map(r => ({
      "Водитель": r.driver?.fullName ?? "–",
      "Таб. номер": r.driver?.serviceNumber ?? "–",
      "Гос. номер": r.bus?.govNumber ?? "–",
      "Гаражный №": r.bus?.garageNumber ?? "–",
      "Маршрут": r.route?.number ?? "–",
      "Причина": r.text ?? "–",
      "Начало ремонта": r.startRepairTime ?? "–",
      "Окончание ремонта": r.endRepairTime ?? "–",
      "Дата завершения": r.endRepairDate ?? "–",
      "Пробег": r.mileage ?? 0,
    }))
    downloadAsExcel(rows, `Неплановые_ремонты_${format(selectedDate, "yyyy-MM-dd")}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <SingleDatePicker date={selectedDate} onChange={setSelectedDate} />
        <Button onClick={handleExport}>Экспорт в Excel</Button>
      </div>

      <ConvoyUnplannedRepairTable repairs={repairs} />
    </div>
  )
}
