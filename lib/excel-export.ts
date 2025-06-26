import { unparse } from "papaparse"

type ExcelRow = Record<string, string | number | undefined | null>

export function downloadAsExcel(data: ExcelRow[], fileName: string) {
  const csv = unparse(data)

  const BOM = "\uFEFF"
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${fileName}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
} 