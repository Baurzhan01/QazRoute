import { Button } from "@/components/ui/button"
import { FileSpreadsheet, FileText, Printer } from "lucide-react"

interface ShiftExportButtonsProps {
  onExportExcel: () => void
  onExportPdf: () => void
  onPrint: () => void
  disabled?: boolean
}

export const ShiftExportButtons = ({ onExportExcel, onExportPdf, onPrint, disabled = false }: ShiftExportButtonsProps) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onExportExcel} disabled={disabled} variant="outline" size="sm">
        <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
      </Button>
      <Button onClick={onExportPdf} disabled={disabled} variant="outline" size="sm">
        <FileText className="h-4 w-4 mr-1" /> PDF
      </Button>
      <Button onClick={onPrint} disabled={disabled} variant="outline" size="sm">
        <Printer className="h-4 w-4 mr-1" /> Печать
      </Button>
    </div>
  )
}
