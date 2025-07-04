import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { RouteExitRepairDto } from "@/types/routeExitRepair.types"

const getShortDriverName = (fullName: string = "", serviceNumber: string = "") => {
  const [last, first, patronymic] = fullName.split(" ")
  const short = `${last || ""} ${first?.[0] || ""}.${patronymic?.[0] || ""}.`
  return `${short} (${serviceNumber})`
}

export async function exportConvoyRepairHistory(
  repairs: RouteExitRepairDto[],
  filename = "convoy-repairs"
) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Ремонты")

  const headers = [
    "№",
    "Дата",
    "VIN",
    "Марка",
    "Техпаспорт",
    "Водитель",
    "Причина",
    "Начало ремонта",
    "Окончание ремонта",
    "Дата выезда",
  ]

  sheet.addRow(headers)

  repairs.forEach((r, index) => {
    const row = sheet.addRow([
      index + 1,
      r.startDate ?? "",
      r.bus?.vinCode ?? "",
      r.bus?.brand ?? "",
      r.bus?.dataSheetNumber ?? "",
      getShortDriverName(r.driver?.fullName, r.driver?.serviceNumber),
      r.text ?? "",
      r.startRepairTime?.slice(0, 5) ?? "",
      r.endRepairTime?.slice(0, 5) ?? "",
      r.endRepairDate ?? "",
    ])

    // Стили для строки:
    row.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }

      if (colNumber === 7) {
        // "Причина"
        cell.font = { bold: true, color: { argb: "FFFF0000" } }
      }
    })
  })

  // Стили для заголовка
  const headerRow = sheet.getRow(1)
  headerRow.eachCell((cell) => {
    cell.font = { bold: true }
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    }
  })

  // Автоширина колонок
  sheet.columns.forEach((column) => {
    let maxLength = 10
    column.eachCell?.((cell) => {
      const value = cell.value?.toString() || ""
      maxLength = Math.max(maxLength, value.length)
    })
    column.width = maxLength + 2
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `${filename}-${new Date().toISOString().split("T")[0]}.xlsx`)
}
