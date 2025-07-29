// utils/exportFinalDispatchToExcel.ts

import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import type {
  FinalDispatchData,
  OrderAssignment,
  ReserveAssignmentUI,
} from "@/types/releasePlanTypes"
import { mapToReserveAssignmentUI } from "../utils/releasePlanUtils"

function formatShortFIO(fullName: string): string {
  const [last, first = "", middle = ""] = fullName.split(" ")
  const initials = `${first?.charAt(0)}.${middle?.charAt(0)}.`.toUpperCase()
  return `${last} ${initials}`
}

function formatTime(value?: string): string {
  return value?.slice(0, 5) || ""
}

export async function exportFinalDispatchToExcel(
  dateStr: string,
  depotNumber: number,
  data: FinalDispatchData,
  orders: OrderAssignment[]
) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Разнарядка")

  const headerFont = { name: "Arial", size: 14, bold: true }
  const baseFont = { name: "Arial", size: 12 }

  // 🟡 Водители и автобусы
  sheet.getCell("A2").value = `Водителей: ${data.driverStatuses.total ?? "—"}`
  sheet.getCell("A2").font = { ...baseFont, bold: true, color: { argb: "FFFFC000" } }

  sheet.getCell("A3").value = `Автобусов: ${data.routeGroups.flatMap(g => g.assignments).length}`
  sheet.getCell("A3").font = { ...baseFont, bold: true, color: { argb: "FFFFC000" } }

  // 🟢 Заголовок по центру I4:O4
  sheet.mergeCells("C4:J4")
  sheet.getCell("C4").value = `План выпуска автобусов на линию Колонна №${depotNumber} на ${new Date(dateStr).toLocaleDateString("ru-RU")} г.`
  sheet.getCell("C4").font = headerFont
  sheet.getCell("C4").alignment = { horizontal: "center" }

  // 🟤 Шапка таблицы
  sheet.mergeCells("A7:A8")
  sheet.mergeCells("B7:B8")
  sheet.mergeCells("C7:C8")
  sheet.mergeCells("D7:D8")
  sheet.mergeCells("E7:E8")
  sheet.mergeCells("F7:F8")
  sheet.mergeCells("G7:G8")
  sheet.mergeCells("H7:H8")
  sheet.mergeCells("I7:J7")
  sheet.mergeCells("K7:K8")

  sheet.getCell("A7").value = "№ маршрута"
  sheet.getCell("B7").value = "Выход"
  sheet.getCell("C7").value = "Гар номер"
  sheet.getCell("D7").value = "Гос. номер"
  sheet.getCell("E7").value = "Заправка"
  sheet.getCell("F7").value = "План обороты"
  sheet.getCell("G7").value = "ФИО"
  sheet.getCell("H7").value = "Таб номер"
  sheet.getCell("I7").value = "План на 1-ю смену"
  sheet.getCell("I8").value = "Время выхода"
  sheet.getCell("J8").value = "Дополнительная информация"
  sheet.getCell("K7").value = "Конец работы"

  // 🧩 Ширина столбцов (ориентируясь на шаблон)
 // 🧩 Ширина столбцов (ориентируясь на шаблон)
const columnWidths = [14, 10, 14, 14, 10, 12, 22, 12, 14, 40, 14]
columnWidths.forEach((w, i) => {
  sheet.getColumn(i + 1).width = w
})


  const headerRows = [sheet.getRow(7), sheet.getRow(8)]
  headerRows.forEach(row => {
    row.font = { ...baseFont, bold: true }
    row.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    row.height = 22
    row.eachCell(cell => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2CC" },
      }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
    })
  })

  // 🔵 Основная таблица
  let rowIndex = 9
  for (const group of data.routeGroups) {
    const startRow = rowIndex
    for (const a of group.assignments) {
      const row = sheet.addRow([
        group.routeNumber,
        a.busLineNumber,
        a.garageNumber,
        a.stateNumber,
        a.fuelAmount ?? "",
        "", // План обороты (пока пусто)
        a.driver ? formatShortFIO(a.driver.fullName) : "",
        a.driver?.serviceNumber ?? "",
        formatTime(a.departureTime),
        a.additionalInfo ?? "",
        formatTime(a.endTime),
      ])
      row.font = baseFont
      row.height = 22
      row.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
      row.eachCell(cell => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        }
      })
      rowIndex++
    }
    if (group.assignments.length > 1) {
      sheet.mergeCells(`A${startRow}:A${rowIndex - 1}`)
    }
  }

  // 🟠 Резерв и заказ
  const writeReserveSection = (title: string, list: ReserveAssignmentUI[]) => {
    if (!list.length) return
    sheet.addRow([])
    const titleRow = sheet.addRow([title])
    titleRow.font = { ...baseFont, bold: true }
    titleRow.alignment = { horizontal: "left" }
    rowIndex++

    for (const r of list) {
      const row = sheet.addRow([
        "—",
        r.sequenceNumber,
        r.garageNumber,
        r.govNumber,
        "",
        "",
        r.driver ? formatShortFIO(r.driver.fullName) : "",
        r.driver?.serviceNumber ?? "",
        formatTime(r.departureTime),
        r.additionalInfo ?? "",
        formatTime(r.endTime),
      ])
      row.font = baseFont
      row.height = 22
      row.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
      row.eachCell(cell => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        }
      })
      rowIndex++
    }
  }

  const mappedReserve = data.reserveAssignments.map((r, i) =>
    mapToReserveAssignmentUI(r, i, "Reserved")
  )
  const mappedOrders = orders.map((r, i) =>
    mapToReserveAssignmentUI(r, i, "Order")
  )

  writeReserveSection("РЕЗЕРВ", mappedReserve)
  writeReserveSection("ЗАКАЗ", mappedOrders)

  const blob = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([blob]), `Разнарядка_на_${dateStr}.xlsx`)
}
