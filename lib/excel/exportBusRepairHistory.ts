// lib/excel/exportBusRepairHistory.ts

import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export async function exportBusRepairHistory(
  busRepairs: RouteExitRepairDto[],
  filename: string
) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("История ремонтов")

  const headers = [
    "№", "Дата", "Время", "Тип", "Причина", "Начало", "Окончание", "Пробег"
  ]

  sheet.addRow(headers)

  busRepairs.forEach((r, idx) => {
    sheet.addRow([
      idx + 1,
      r.startDate || "-",
      r.startTime?.slice(0, 5) || "-",
      r.repairType || "-",
      r.text || "-",
      r.startRepairTime?.slice(0, 5) || "-",
      r.endRepairTime?.slice(0, 5) || "-",
      r.mileage ?? "-"
    ])
  })

  sheet.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
      cell.alignment = { vertical: "middle", horizontal: "center" }
    })
  })

  sheet.columns.forEach(col => {
    let max = 10
    col.eachCell?.(cell => {
      max = Math.max(max, String(cell.value).length)
    })
    col.width = max + 2
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `${filename}.xlsx`)
}
