import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export const exportUnscheduledRepairs = async (repairs: RouteExitRepairDto[], dateStr: string) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Неплановые ремонты")

  const headers = [
    "№", "Дата", "Время заезда", "Колонна", "Маршрут / Выход",
    "ФИО водителя", "Гос. № (Гаражный №)", "Причина",
    "Начало ремонта", "Окончание ремонта", "Дата окончания", "Выезд", "Пробег"
  ]

  worksheet.addRow(headers)
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.alignment = { vertical: "middle", horizontal: "center" }
  headerRow.eachCell(cell => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFECECEC" },
    }
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    }
  })

  // Вычисление повторных заездов
  const seenBusIds = new Set<string>()
  const repeatEntryIds = new Set<string>()
  for (const r of repairs) {
    const busId = r.bus?.id
    if (!busId) continue
    if (seenBusIds.has(busId)) repeatEntryIds.add(r.id)
    seenBusIds.add(busId)
  }

  for (const [idx, r] of repairs.entries()) {
    const isRepeat = repeatEntryIds.has(r.id)
    const isLongTerm = r.repairType === "LongTerm"
    const isFinished = !!r.andTime

    // Причина с метками
    let reasonText = r.text || "-"
    if (isRepeat) reasonText += " • Повторный заезд"
    if (isLongTerm) reasonText += " • Длительный ремонт"

    const row = worksheet.addRow([
      idx + 1,
      r.startDate || "-",
      r.startTime?.slice(0, 5) || "-",
      r.convoy?.number ? `№${r.convoy.number}` : "-",
      r.route?.number ? `${r.route.number}${r.busLine?.number ? ` / ${r.busLine.number}` : ""}` : "-",
      r.driver?.fullName ? `${r.driver.fullName} (${r.driver.serviceNumber})` : "-",
      r.bus?.govNumber && r.bus?.garageNumber ? `${r.bus.govNumber} (${r.bus.garageNumber})` : "-",
      reasonText,
      r.startRepairTime?.slice(0, 5) || "-",
      r.endRepairTime?.slice(0, 5) || "-",
      r.endRepairDate || "-",
      r.andTime?.slice(0, 5) || "-",
      r.mileage ?? "-"
    ])

    // Цвет заливки по статусу
    let fillColor: string | undefined = undefined
    if (isFinished) fillColor = "FFCCFFCC" // зелёный
    else if (isLongTerm) fillColor = "FFFFCCCC" // красный
    else if (isRepeat) fillColor = "FFFFFF99" // жёлтый

    row.eachCell(cell => {
      if (fillColor) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        }
      }
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    })
  }

  // Автоширина колонок
  worksheet.columns.forEach(column => {
    let maxLength = 10
    column.eachCell?.((cell) => {
      const val = String(cell.value ?? "")
      maxLength = Math.max(maxLength, val.length)
    })
    column.width = maxLength + 2
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `repair-logs_${dateStr}.xlsx`)
}
