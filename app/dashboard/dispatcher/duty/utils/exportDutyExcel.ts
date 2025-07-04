import * as XLSX from "xlsx"
import { DispatchDutyRecord } from "@/types/releasePlanTypes"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

function formatShortName(fullName?: string): string {
  if (!fullName) return "—"
  const parts = fullName.trim().split(" ")
  const [last, first, patronymic] = parts
  const initials = [first, patronymic]
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() + ".")
    .join("")
  return `${last} ${initials}`
}

export function exportDutyExcel(data: DispatchDutyRecord[], dateStr: string) {
  const date = new Date(dateStr)
  const displayDate = format(date, "d MMMM yyyy", { locale: ru })

  const groupedMap = new Map<string, DispatchDutyRecord[]>()
  data.forEach((r) => {
    const route = r.routeNumber || "—"
    if (!groupedMap.has(route)) groupedMap.set(route, [])
    groupedMap.get(route)?.push(r)
  })

  const sortedGroups = Array.from(groupedMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b, "ru", { numeric: true })
  )

  const sheetData: any[][] = []
  sheetData.push([`Разнарядка на ${displayDate}`])
  sheetData.push([
    "Маршрут",
    "Маршрут",
    "Выход",
    "Гаражный №",
    "Гос. №",
    "VIN",
    "Марка",
    "ФИО водителя",
  ])

  const merges: XLSX.Range[] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
  let rowOffset = 2

  sortedGroups.forEach(([routeNumber, records], routeIdx) => {
    records.forEach((r, idx) => {
      const row: any[] = []
      if (idx === 0) {
        row.push(routeNumber)
      } else {
        row.push(null)
      }

      row.push(routeNumber)
      row.push(r.busLineNumber || "—")
      row.push(r.garageNumber || "—")
      row.push(r.govNumber || "—")
      row.push(r.vinCode || "—")
      row.push(r.busBrand || "—")
      row.push(formatShortName(r.driverFullName))
      sheetData.push(row)
    })

    // merge для сгруппированного маршрута
    merges.push({
      s: { r: rowOffset, c: 0 },
      e: { r: rowOffset + records.length - 1, c: 0 },
    })

    rowOffset += records.length
  })

  const ws = XLSX.utils.aoa_to_sheet(sheetData)
  ws["!merges"] = merges
  ws["!cols"] = [
    { wch: 10 },
    { wch: 10 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 30 },
  ]

  const wb = XLSX.utils.book_new()

  // 🎨 Стиль для всех ячеек
  const zebraColors = ["DCEEFF", "FFF3D6"]
  const cellStyle = (fill: string) => ({
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: fill } },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  })

  // заголовок
  const titleCell = ws["A1"]
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: "center", vertical: "center" },
    }
  }

  // шапка таблицы
  for (let c = 0; c <= 7; c++) {
    const header = ws[XLSX.utils.encode_cell({ r: 1, c })]
    if (header) {
      header.s = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "E2E8F0" } },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      }
    }
  }

  // строки
  let currentRow = 2
  sortedGroups.forEach(([_, records], routeIdx) => {
    const fill = zebraColors[routeIdx % 2]

    records.forEach((_, i) => {
      for (let c = 0; c <= 7; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r: currentRow + i, c })]
        if (cell) cell.s = cellStyle(fill)
      }
    })

    currentRow += records.length
  })

  ws["!autofilter"] = { ref: "B2:H2" }

  XLSX.utils.book_append_sheet(wb, ws, "Дьюти")
  XLSX.writeFile(wb, `duty-${dateStr}.xlsx`)
}
