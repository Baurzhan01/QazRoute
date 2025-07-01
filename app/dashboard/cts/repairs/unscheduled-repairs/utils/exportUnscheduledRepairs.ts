import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export const exportUnscheduledRepairs = async (repairs: RouteExitRepairDto[], dateStr: string) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Неплановые ремонты")

  const headers = [
    "№", "Дата", "Время заезда", "Колонна", "Маршрут / Выход",
    "ФИО водителя", "Гос. № (Гаражный №)", "Причина",
    "Время начала ремонта", "Время окончания ремонта",
    "Дата окончания", "Время выезда", "Пробег"
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
  })

  // Группировка по автобусу
  const grouped = repairs.reduce<Record<string, RouteExitRepairDto[]>>((acc, repair) => {
    const busId = repair.bus?.id
    if (busId) {
      if (!acc[busId]) acc[busId] = []
      acc[busId].push(repair)
    }
    return acc
  }, {})

  repairs.forEach((r, idx) => {
    const busId = r.bus?.id
    if (!busId) return // избегаем ошибок, если нет автобуса

    const isRepeat = grouped[busId].length > 1
    const isLastRepeat = grouped[busId].at(-1)?.id === r.id
    const isLongTerm = r.repairType === "LongTerm"

    let reasonText = r.text || "-"
    if (isLastRepeat) reasonText += " • Повторный заезд"
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

    const fillColor =
      isLongTerm ? "FFFF9999" : // красная
      isLastRepeat ? "FFFFFF99" : undefined // жёлтая только для последнего повторного

    if (fillColor) {
      row.eachCell(cell => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        }
      })
    }
  })

  worksheet.columns.forEach(column => {
    let maxLength = 10
    column.eachCell?.((cell) => {
      const val = String(cell.value)
      maxLength = Math.max(maxLength, val.length)
    })
    column.width = maxLength + 2
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `repair-logs_${dateStr}.xlsx`)
}
