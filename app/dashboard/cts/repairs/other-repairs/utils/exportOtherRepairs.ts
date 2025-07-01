import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { format } from "date-fns"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export async function exportOtherRepairsToExcel(repairs: RouteExitRepairDto[]) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Прочие ремонты")

  // Заголовки
  sheet.addRow([
    "№",
    "Дата",
    "Колонна",
    "Маршрут / Выход",
    "ФИО водителя",
    "Гос. № / Гар. №",
    "Причина",
    "Время начала",
    "Время окончания",
    "Дата окончания",
    "Статус",
  ]).font = { bold: true }

  repairs.forEach((r, idx) => {
    const row = sheet.addRow([
      idx + 1,
      r.startDate ?? "–",
      r.convoy?.number ? `№${r.convoy.number}` : "–",
      r.route?.number ? `${r.route.number}${r.busLine?.number ? ` / ${r.busLine.number}` : ""}` : "–",
      r.driver?.fullName ? `${r.driver.fullName} (${r.driver.serviceNumber})` : "–",
      r.bus?.govNumber && r.bus?.garageNumber ? `${r.bus.govNumber} (${r.bus.garageNumber})` : "–",
      r.text ?? "–",
      r.startRepairTime ?? "–",
      r.endRepairTime ?? "–",
      r.endRepairDate ?? "–",
      r.endRepairTime ? "Завершён" : "В процессе",
    ])

    if (r.endRepairTime) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "C6F6D5" }, // зелёная заливка
      }
    }
  })

  // Автоширина
  sheet.columns.forEach((col) => {
    let max = 10
    col.eachCell?.({ includeEmpty: true }, (cell) => {
      const value = String(cell.value ?? "")
      max = Math.max(max, value.length)
    })
    col.width = max + 2
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `other-repairs_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
}
