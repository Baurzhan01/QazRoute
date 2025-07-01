import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { format } from "date-fns"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export async function exportLongRepairsToExcel(repairs: RouteExitRepairDto[]) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Длительные ремонты")

  sheet.addRow([
    "#",
    "Дата начала",
    "Колонна",
    "Гос. № / Гар. №",
    "ФИО водителя",
    "Причина",
    "Дата окончания",
    "Пробег",
    "Статус",
  ]).font = { bold: true }

  repairs.forEach((r, idx) => {
    const row = sheet.addRow([
      idx + 1,
      r.startDate ?? "–",
      r.convoy?.number ? `№${r.convoy.number}` : "–",
      r.bus?.govNumber && r.bus?.garageNumber ? `${r.bus.govNumber} (${r.bus.garageNumber})` : "–",
      r.driver?.fullName ? `${r.driver.fullName} (${r.driver.serviceNumber})` : "–",
      r.text ?? "–",
      r.endRepairDate ?? "–",
      r.mileage ?? "–",
      r.endRepairDate ? "Завершён" : "В процессе",
    ])

    if (r.endRepairDate) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "C6F6D5" }, // зелёная заливка
      }
    }
  })

  sheet.columns.forEach((col) => {
    let max = 10
    col.eachCell?.({ includeEmpty: true }, (cell) => {
      const val = String(cell.value ?? "")
      max = Math.max(max, val.length)
    })
    col.width = max + 2
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `long-repairs_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
}
