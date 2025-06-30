"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { utils, writeFile } from "xlsx"
import { getAuthData } from "@/lib/auth-utils"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarIcon, FileDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CtsReportPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any[]>([])

  const auth = getAuthData()
  const depotId = auth?.busDepotId
  const formattedDate = useMemo(() => format(date, "yyyy-MM-dd"), [date])

  const loadReport = async () => {
    if (!depotId) return
    setLoading(true)
    const res = await routeExitRepairService.getByDate(formattedDate, depotId)
    if (res.isSuccess && res.value) {
      setReportData(res.value)
    } else {
      toast({ title: "Ошибка", description: "Не удалось загрузить отчёт", variant: "destructive" })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadReport()
  }, [formattedDate])

  const exportToExcel = () => {
    if (!reportData.length) return

    const worksheetData = reportData.map((r) => ({
      "Дата": r.startDate ?? "—",
      "Колонна": r.convoy?.number ? `№${r.convoy.number}` : "—",
      "Маршрут": r.route?.number ?? "—",
      "Выход": r.busLine?.number ?? "—",
      "Водитель": r.driver?.fullName ?? "—",
      "Автобус": r.bus?.garageNumber ?? "—",
      "Причина": r.text ?? "—",
      "Тип": r.repairType ?? "—",
      "Статус": r.status ?? "—",
    }))

    const worksheet = utils.json_to_sheet(worksheetData)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, "Отчёт")

    writeFile(workbook, `repair-report_${formattedDate}.xlsx`)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Отчёт по ремонтам за день</h1>

      <div className="flex flex-wrap gap-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Дата:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-48 text-left", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} locale={ru} />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={loadReport} disabled={loading}>Обновить</Button>
        <Button variant="secondary" onClick={exportToExcel}>
          <FileDown className="h-4 w-4 mr-2" />
          Экспорт
        </Button>
      </div>

      <div className="mt-6 overflow-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Дата</th>
              <th className="border px-2 py-1">Колонна</th>
              <th className="border px-2 py-1">Маршрут</th>
              <th className="border px-2 py-1">Выход</th>
              <th className="border px-2 py-1">Водитель</th>
              <th className="border px-2 py-1">Автобус</th>
              <th className="border px-2 py-1">Причина</th>
              <th className="border px-2 py-1">Тип</th>
              <th className="border px-2 py-1">Статус</th>
            </tr>
          </thead>
          <tbody>
            {reportData.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  Нет данных за выбранную дату
                </td>
              </tr>
            ) : (
              reportData.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="border px-2 py-1 text-center">{r.startDate ?? "—"}</td>
                  <td className="border px-2 py-1 text-center">{r.convoy?.number ? `№${r.convoy.number}` : "—"}</td>
                  <td className="border px-2 py-1 text-center">{r.route?.number ?? "—"}</td>
                  <td className="border px-2 py-1 text-center">{r.busLine?.number ?? "—"}</td>
                  <td className="border px-2 py-1">{r.driver?.fullName ?? "—"}</td>
                  <td className="border px-2 py-1 text-center">{r.bus?.garageNumber ?? "—"}</td>
                  <td className="border px-2 py-1">{r.text ?? "—"}</td>
                  <td className="border px-2 py-1 text-center">{r.repairType ?? "—"}</td>
                  <td className="border px-2 py-1 text-center">{r.status ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
