"use client"

import { Button } from "@/components/ui/button"
import { useCallback } from "react"
import html2pdf from "html2pdf.js"
import { formatDateLabel } from "@/app/dashboard/fleet-manager/release-plan/utils/dateUtils"
import type { FinalDispatchData } from "@/types/releasePlanTypes"

interface FinalDispatchExportProps {
  date: Date
  data: FinalDispatchData
  depotName: string
}

export default function FinalDispatchExport({ date, data, depotName }: FinalDispatchExportProps) {
  const handleExport = useCallback(() => {
    const element = document.getElementById("final-dispatch-table")
    if (!element) return

    const opt = {
      margin: 0.2,
      filename: `План выпуска - ${depotName} - ${formatDateLabel(date)}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "mm", format: [297, 420], orientation: "portrait" } // A3
    }

    html2pdf().set(opt).from(element).save()
  }, [date, data, depotName])

  return (
    <Button onClick={handleExport} variant="default">
      📄 Скачать PDF
    </Button>
  )
}
