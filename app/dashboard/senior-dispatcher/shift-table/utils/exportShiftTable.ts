import * as XLSX from "xlsx"
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
export function exportToExcel(shifts: UserWorkShift[], monthData: MonthData) {
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

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
  const workbook = { 
    Sheets: { "Табель": worksheet }, 
    SheetNames: ["Табель"],
    Props: {}
  }
  XLSX.writeFile(workbook, `Табель_${year}_${month}.xlsx`)
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
