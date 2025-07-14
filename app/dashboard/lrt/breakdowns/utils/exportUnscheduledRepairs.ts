import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"

export const exportUnscheduledRepairs = async (
  repairs: RouteExitRepairDto[],
  dateStr: string
) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Неплановые ремонты")

  const headers = [
    "№",
    "Дата",
    "Время заезда",
    "Колонна",
    "Маршрут",
    "Выход",
    "ФИО водителя",
    "Гос. №",
    "Гаражный №",
    "Причина",
    "Начало ремонта",
    "Окончание ремонта",
    "Дата окончания",
    "Время выезда",
    "Пробег",
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
    const isLong = r.repairType === "LongTerm"
    const isFinished = !!r.andTime
    const isReady = !!r.isReady

    const cleanHtml = (html: string) => html.replace(/<[^>]+>/g, "").trim()
    let reason = r.text ? cleanHtml(r.text) : "-"
    if (isRepeat) reason += " • Повторный заезд"
    if (isLong) reason += " • Длительный ремонт"

    const routeNumber = r.route?.number || "-"
    const busLineNumber = r.busLine?.number || "-"
    const govNumber = r.bus?.govNumber || "-"
    const garageNumber = r.bus?.garageNumber || "-"
    const driver = r.driver?.fullName ? `${r.driver.fullName} (${r.driver.serviceNumber})` : "-"

    const row = worksheet.addRow([
      idx + 1,
      r.startDate || "-",
      r.startTime?.slice(0, 5) || "-",
      r.convoy?.number ? `№${r.convoy.number}` : "-",
      routeNumber,
      busLineNumber,
      driver,
      govNumber,
      garageNumber,
      reason,
      r.startRepairTime?.slice(0, 5) || "–",
      r.endRepairTime?.slice(0, 5) || "–",
      r.endRepairDate || "–",
      r.andTime?.slice(0, 5) || "–",
      r.mileage ?? "–",
    ])

    let fillColor: string | undefined
    if (isReady) fillColor = "FFCCEEFF"
    else if (isFinished) fillColor = "FFCCFFCC"
    else if (isLong) fillColor = "FFFFCCCC"
    else if (isRepeat) fillColor = "FFFFFF99"

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
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      }
    })
  }

  worksheet.columns.forEach(col => {
    let max = 10
    col.eachCell?.(cell => {
      const val = String(cell.value || "")
      max = Math.max(max, val.length)
    })
    col.width = max + 2
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `lrt-breakdowns_${dateStr}.xlsx`)
}
