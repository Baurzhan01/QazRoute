import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import type { GroupedRepairsByConvoy } from "@/types/repair.types"

export async function exportAllRepairs(data: GroupedRepairsByConvoy[], date: string) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Плановые ремонты")

  // Заголовки
  sheet.addRow([
    "Колонна",
    "Гос. номер",
    "Гаражный номер",
    "ФИО водителя",
    "Таб. номер",
    "Описание",
  ])

  sheet.getRow(1).font = { bold: true }

  // Данные
  data.forEach(group => {
    group.repairs.forEach(r => {
      const row = sheet.addRow([
        `№${group.convoyNumber}`,
        r.bus?.govNumber ?? "–",
        r.bus?.garageNumber ?? "–",
        r.driver?.fullName ?? "–",
        r.driver?.serviceNumber ?? "–",
        r.description ?? "–",
      ])
      row.alignment = { vertical: "middle", horizontal: "left" }
    })
  })

  // Автоширина
  sheet.columns.forEach(column => {
    let maxLength = 10
    column.eachCell?.({ includeEmpty: true }, cell => {
      const value = cell.value ? String(cell.value) : ""
      maxLength = Math.max(maxLength, value.length)
    })
    column.width = maxLength + 2
  })

  // Генерация файла
  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `planned-repairs_${date}.xlsx`)
}
