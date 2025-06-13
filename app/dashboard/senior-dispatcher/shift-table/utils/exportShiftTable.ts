import { Workbook, Column } from "exceljs"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { UserWorkShift } from "@/types/coordinator.types"
import type { MonthData } from "../types/shift.types"

// 🔠 Маркировка смен
function getShiftMark(shiftType?: string): string {
  switch (shiftType) {
    case "day": return "Д"
    case "night": return "Н"
    case "vacation": return "О"
    case "dayOff": return "В"
    case "absent": return "П"
    default: return ""
  }
}

// 📊 Экспорт в Excel
export async function exportToExcel(shifts: UserWorkShift[], monthData: MonthData) {
  const { year, month, daysInMonth } = monthData

  const headers = [
    "ФИО",
    ...Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
    "День", "Ночь", "Отпуск", "Выходной", "Пропуск"
  ]

  const data = shifts.map((user) => {
    const row: (string | number)[] = [user.fullName]
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const shift = user.days.find((d) => d.date === dateStr)
      row.push(getShiftMark(shift?.shiftType))
    }
    row.push(user.day, user.night, user.vacation, user.dayOff, user.skip)
    return row
  })

  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet("Табель")
  
  // Добавляем заголовки
  worksheet.addRow(headers)
  
  // Добавляем данные
  data.forEach(row => worksheet.addRow(row))
  
  // Настраиваем стили
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
  
  // Автоматическая ширина столбцов
  worksheet.columns?.forEach((column) => {
    if (column) {
      column.width = 15
    }
  })

  // Сохраняем файл
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Табель_${year}_${month}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
}

// 🧾 Экспорт в PDF
export function exportToPdf(shifts: UserWorkShift[], monthData: MonthData) {
  const { year, month, daysInMonth } = monthData
  const doc = new jsPDF("landscape")

  const headers = [
    "ФИО",
    ...Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
    "День", "Ночь", "Отпуск", "Выходной", "Пропуск"
  ]

  const data = shifts.map((user) => {
    const row: (string | number)[] = [user.fullName]
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const shift = user.days.find((d) => d.date === dateStr)
      row.push(getShiftMark(shift?.shiftType))
    }
    row.push(user.day, user.night, user.vacation, user.dayOff, user.skip)
    return row
  })

  autoTable(doc, {
    head: [headers],
    body: data,
    styles: { fontSize: 6 },
    headStyles: { fillColor: [22, 160, 133] },
    margin: { top: 20 },
    didParseCell: (data) => {
      const val = data.cell.raw
      const colorMap: Record<string, [number, number, number]> = {
        "Д": [255, 221, 77],
        "Н": [210, 180, 255],
        "О": [173, 216, 230],
        "В": [230, 230, 230],
        "П": [255, 150, 150],
      }

      if (typeof val === "string" && colorMap[val]) {
        data.cell.styles.fillColor = colorMap[val]
      }
    },
  })

  doc.save(`Табель_${year}_${month}.pdf`)
}
