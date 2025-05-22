"use client"

import { Button } from "@/components/ui/button"
import { useCallback, useEffect, useState } from "react"
import { formatDateLabel } from "@/app/dashboard/fleet-manager/release-plan/utils/dateUtils"
import type { FinalDispatchData } from "@/types/releasePlanTypes"

interface FinalDispatchExportProps {
  date: Date
  data: FinalDispatchData
  depotName: string
}

export default function FinalDispatchExport({ date, data, depotName }: FinalDispatchExportProps) {
  const [html2pdf, setHtml2pdf] = useState<any>(null)

  useEffect(() => {
    // Динамический импорт — только на клиенте
    import("html2pdf.js").then((mod) => {
      setHtml2pdf(mod.default || mod)
    })
  }, [])

  const handleExport = useCallback(() => {
    if (!html2pdf) return

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
  }, [html2pdf, date, data, depotName])

  return (
    <Button onClick={handleExport} variant="default" disabled={!html2pdf}>
      📄 Скачать PDF
    </Button>
  )
}
