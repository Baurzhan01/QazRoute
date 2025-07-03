import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { format } from "date-fns"
import { RouteExitRepairDto, RouteExitRepairStatus } from "@/types/routeExitRepair.types"
import { repairTypeLabels } from "@/lib/utils/repair-utils"

export async function exportRepairsToExcelGrouped(
  allRepairs: RouteExitRepairDto[],
  selectedTypes: RouteExitRepairStatus[],
  fromDate: Date
) {
  const workbook = new ExcelJS.Workbook()

  for (const type of selectedTypes) {
    const repairs = allRepairs.filter((r) => r.repairType === type)

    const sheet = workbook.addWorksheet(repairTypeLabels[type]?.substring(0, 31) || type)

    const headers = [
      "Гос. номер",
      "Гаражный номер",
      "Марка",
      "VIN",
      "Техпаспорт",
      "Автоколонна",
      "Тип ремонта",
      "Причина",
      "Начало",
      "Окончание",
    ]

    sheet.addRow(headers)
    const headerRow = sheet.getRow(1)

    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      }
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
    })

    for (const repair of repairs) {
      const row = sheet.addRow([
        repair.bus?.govNumber || "—",
        repair.bus?.garageNumber || "—",
        repair.bus?.brand || "—",
        repair.bus?.vinCode || "—",
        repair.bus?.dataSheetNumber || "—",
        repair.convoy?.number ? `№${repair.convoy.number}` : "—",
        repairTypeLabels[repair.repairType as RouteExitRepairStatus] || "—",
        repair.text || "—",
        `${repair.startDate} ${repair.startTime?.slice(0, 5) || ""}`,
        repair.endRepairDate
          ? `${repair.endRepairDate} ${repair.endRepairTime?.slice(0, 5) || ""}`
          : "—",
      ])

      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        }
      })
    }

    // Автоширина колонок
    sheet.columns.forEach((column) => {
      let maxLength = 10
      column.eachCell?.((cell) => {
        const val = String(cell.value ?? "")
        maxLength = Math.max(maxLength, val.length)
      })
      column.width = maxLength + 2
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const fileName = `Ремонты_${format(fromDate, "yyyy-MM-dd")}.xlsx`
  saveAs(new Blob([buffer]), fileName)
}
