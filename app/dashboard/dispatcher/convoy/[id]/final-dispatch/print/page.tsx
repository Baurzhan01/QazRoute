"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

import { convoyService } from "@/service/convoyService"
import { releasePlanService } from "@/service/releasePlanService"

import { getDayTypeFromDate } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/dateUtils"
import type { DayType, RouteBucket } from "../types"
import { routeStatusMap } from "../utils/constants"
import { splitRoutes } from "../utils/helpers"
import StatementRoutesTable from "../components/StatementRoutesTable"
import RemovedRoutesTable from "../components/RemovedRoutesTable"

// no need for summary totals: we mirror the main view layout

const StatementPrintPage = () => {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const convoyId = (params?.id as string) || ""
  const dateParam = searchParams.get("date")

  const targetDate = useMemo(() => {
    if (!dateParam) return new Date()
    const parsed = new Date(`${dateParam}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }, [dateParam])

  const dateStr = useMemo(() => format(targetDate, "yyyy-MM-dd"), [targetDate])
  const prettyDate = useMemo(
    () => format(targetDate, "d MMMM yyyy (EEEE)", { locale: ru }),
    [targetDate]
  )
  const dayType = useMemo<DayType>(() => getDayTypeFromDate(dateStr) as DayType, [dateStr])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [convoyLabel, setConvoyLabel] = useState<string>("")
  const [title, setTitle] = useState<string>("Ведомость")
  const [routes, setRoutes] = useState<RouteBucket[]>([])
  const [removedRows, setRemovedRows] = useState<any[]>([])

  const [pendingInputs] = useState<Record<string, string>>({})
  const [savingRows] = useState<Record<string, boolean>>({})

  const buildTitle = useCallback((label: string, targetDate: Date, convoyNumber?: number | null) => {
    const convoyPart = convoyNumber ? ` автоколонна №${convoyNumber}` : ""
    const needsSuffix = label && (!convoyNumber || !String(label).includes(String(convoyNumber)))
    const suffix = needsSuffix ? ` (${label})` : ""
    return `Ведомость${convoyPart}${suffix} на ${format(targetDate, "d MMMM yyyy", { locale: ru })}`
  }, [])

  useEffect(() => {
    if (!convoyId) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [statementRes, summaryRes] = await Promise.all([
          releasePlanService.getFullStatementByDate(dateStr, convoyId, routeStatusMap[dayType]),
          convoyService.getConvoySummary(convoyId, dateStr).catch(() => null),
        ])

        const data = statementRes.value ?? null
        const buckets = splitRoutes(data?.routes ?? [])
        setRoutes(buckets)
        // removed rows are rendered by RemovedRoutesTable; we just pass rows it expects
        const removed = buckets.flatMap(b => b.rows).filter(r => r.status === "Rejected")
        setRemovedRows(removed as any)

        const summary = summaryRes?.value ?? summaryRes ?? {}
        // robust convoy number resolution
        let convoyNumber: number | null = null
        if (typeof summary?.convoyNumber === 'number') convoyNumber = summary.convoyNumber
        else if (typeof summary?.number === 'number') convoyNumber = summary.number
        else if (typeof summary?.convoy?.number === 'number') convoyNumber = summary.convoy.number
        if (convoyNumber == null) {
          try {
            const byId = await convoyService.getById(convoyId)
            if (byId?.isSuccess && typeof byId.value?.number === 'number') convoyNumber = byId.value.number
          } catch {}
        }
        const label = convoyNumber ? `Автоколонна №${convoyNumber}` : (summary?.convoyName || "")
        setConvoyLabel(label)
        setTitle(buildTitle(label, targetDate, convoyNumber ?? undefined))
      } catch (err: any) {
        console.error("print statement error", err)
        const message = err?.message || "Не удалось загрузить ведомость"
        setError(message)
        toast({
          title: "Ошибка",
          description: message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [convoyId, dateStr, dayType])

  const handlePrint = () => window.print()
  const handleClose = () => router.back()

  // Автопечать убрана — печать только по кнопке

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Печатная версия ведомости</h1>
          <p className="text-sm text-muted-foreground">{prettyDate}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Закрыть
          </Button>
          <Button onClick={handlePrint}>Печать</Button>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 py-6">
        <section className="rounded-xl bg-white p-6 shadow-sm print:shadow-none">
          <header className="mb-6 text-center">
            {convoyLabel && <p className="text-sm text-slate-500">{convoyLabel}</p>}
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          </header>

          {loading && <p className="text-center text-muted-foreground">Загрузка...</p>}
          {error && !loading && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="flex flex-col gap-8">
              <div id="print-root" className="print-area">
                <StatementRoutesTable
                  routes={routes}
                  pendingInputs={pendingInputs}
                  savingRows={savingRows}
                  onInputChange={() => {}}
                  onAction={() => {}}
                  actionsDisabled
                />
              </div>
              {/* Дополнительные блоки на экране, но не в печати */}
              <div className="no-print">
                <RemovedRoutesTable
                  rows={removedRows as any}
                  onReturn={() => {}}
                  onViewLog={() => {}}
                  statusSubmitting={false}
                />
              </div>
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; margin: 0; }
          /* Печатаем только область с таблицей */
          body * { visibility: hidden; }
          #print-root, #print-root * { visibility: visible; }
          #print-root { position: absolute; left: 0; top: 0; width: 100%; }

          .print\:shadow-none { box-shadow: none !important; }
          main { padding: 0 !important; }
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }

          /* Компактный печатный стиль */
          .print-area { font-size: 11pt; line-height: 1.25; max-width: none !important; width: auto !important; }
          .print-area table { border-collapse: collapse !important; }
          .print-area th, .print-area td { padding: 4pt 6pt !important; border: 1px solid #444 !important; }
          .print-area thead th { font-weight: 600; }
          .print-area [class*="bg-"] { background: transparent !important; }
          .print-area [class*="shadow"] { box-shadow: none !important; }
          .print-area .border { border-color: #444 !important; }
          .print-area .text-muted-foreground { color: #111 !important; }
          .print-area .overflow-x-auto, .print-area .overflow-y-auto { overflow: visible !important; }
          .print-area .w-full { width: 100% !important; }
          .print-area .max-w-\[1200px\] { max-width: none !important; }
          .print-area .px-6 { padding-left: 0 !important; padding-right: 0 !important; }
          .print-area .py-6 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print-area .rounded-xl { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  )
}

export default StatementPrintPage

