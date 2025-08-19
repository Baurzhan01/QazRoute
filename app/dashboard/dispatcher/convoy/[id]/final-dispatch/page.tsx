"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

import { releasePlanService } from "@/service/releasePlanService"
import { convoyService } from "@/service/convoyService"
import { getDayTypeFromDate } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/dateUtils"

type DayType = "workday" | "saturday" | "sunday" | "holiday"

const routeStatusMap: Record<DayType, string> = {
  workday: "Workday",
  saturday: "Saturday",
  sunday: "Sunday",
  holiday: "Holiday",
}

type NormalizedAssignment = {
  dispatchBusLineId: string
  routeNumber: string | number
  busLineNumber: string | number
  govNumber: string
  garageNumber: string
  tabNumber: string
  planRevolutions?: number | null
  factRevolutions?: number | null
  spokenRevolutions?: number | null // «со слов водителей»
  dropNotes?: string | null
  ob?: string | null
  note?: string | null
}

type RouteBlock = {
  routeNumber: string | number
  rows: NormalizedAssignment[]
  totals: {
    plan: number
    fact: number
    spoken: number
  }
}

/* ===== helpers ===== */

function sumNums(arr: ReadonlyArray<number | null | undefined>): number {
  let total = 0
  for (const v of arr) {
    const n = typeof v === "number" && Number.isFinite(v) ? v : 0
    total += n
  }
  return total
}

function fmtNum(x?: number | null): string {
  if (x == null || Number.isNaN(Number(x))) return ""
  return String(x).replace(".", ",")
}

/** Делает подпись вида "Автоколонна №X" из summary */
function getAKTitle(summary: any): string {
  const direct = summary?.convoyNumber ?? summary?.number ?? summary?.convoy?.number
  if (direct != null && direct !== "") return `Автоколонна №${direct}`

  const nameCandidate =
    summary?.convoyName ?? summary?.name ?? summary?.convoy?.name ?? ""

  const m = String(nameCandidate).match(
    /Автоколонна\s*№\s*(\d+)|№\s*(\d+)|\bAK?-?\s*(\d+)/i
  )
  const num = m?.[1] || m?.[2] || m?.[3]
  if (num) return `Автоколонна №${num}`

  return ""
}

/* ===== page ===== */

export default function StatementConvoyPage() {
  const router = useRouter()
  const params = useParams()
  const convoyId = (params?.id as string) || ""

  const [date, setDate] = useState(() => new Date())
  const dateStr = useMemo(() => format(date, "yyyy-MM-dd"), [date])
  const dayType = useMemo<DayType>(() => getDayTypeFromDate(dateStr) as DayType, [dateStr])

  const [loading, setLoading] = useState(true)
  const [blocks, setBlocks] = useState<RouteBlock[]>([])
  const [title, setTitle] = useState<string>("Ведомость")
  const [convoyLabel, setConvoyLabel] = useState<string>("") // "Автоколонна №X"

  const prettyDate = useMemo(
    () => format(date, "d MMMM yyyy (EEEE)", { locale: ru }),
    [date]
  )

  useEffect(() => {
    const load = async () => {
      if (!convoyId) return
      setLoading(true)
      try {
        const [statementRes, summaryRes] = await Promise.all([
          releasePlanService.getFullStatementByDate(
            dateStr,
            convoyId,
            routeStatusMap[dayType]
          ),
          convoyService.getConvoySummary(convoyId, dateStr).catch(() => null),
        ])

        const sVal: any = summaryRes?.value ?? summaryRes ?? {}
        const akTitle = getAKTitle(sVal)
        setConvoyLabel(akTitle)

        const v: any = statementRes.value ?? {}
        const rawRoutes: any[] = v.routes ?? []

        const allRows: NormalizedAssignment[] = []
        for (const r of rawRoutes) {
          const rn = r.routeNumber
          for (const bl of r.busLines ?? []) {
            allRows.push({
              dispatchBusLineId: bl.dispatchBusLineId,
              routeNumber: rn,
              busLineNumber: bl.busLineNumber ?? "—",
              govNumber: bl.bus?.govNumber ?? "—",
              garageNumber: bl.bus?.garageNumber ?? "—",
              tabNumber: bl.firstDriver?.serviceNumber ?? "",
              planRevolutions: bl.planRevolutions ?? null,
              factRevolutions: bl.factRevolutions ?? null,
              spokenRevolutions: bl.revolutions ?? null,
              dropNotes: bl.dropNotes ?? null,
              ob: bl.ob ?? null,
              note: bl.description ?? null,
            })
          }
        }

        // группировка по маршруту
        const byRoute = new Map<string | number, NormalizedAssignment[]>()
        for (const r of allRows) {
          const key = r.routeNumber
          if (!byRoute.has(key)) byRoute.set(key, [])
          byRoute.get(key)!.push(r)
        }

        const blocksData: RouteBlock[] = Array.from(byRoute.entries())
          .sort((a, b) => String(a[0]).localeCompare(String(b[0]), "ru", { numeric: true }))
          .map<RouteBlock>(([routeNumber, rows]) => {
            const sorted = [...rows].sort((a, b) =>
              String(a.busLineNumber).localeCompare(String(b.busLineNumber), "ru", { numeric: true })
            )
            const totals = {
              plan: sumNums(sorted.map(x => x.planRevolutions)),
              fact: sumNums(sorted.map(x => x.factRevolutions)),
              spoken: sumNums(sorted.map(x => x.spokenRevolutions)),
            }
            return { routeNumber, rows: sorted, totals }
          })

        setBlocks(blocksData)

        const company = "АО АП-1"
        const akText = akTitle ? ` (${akTitle})` : ""
        setTitle(`Ведомость ${company}${akText} на ${format(date, "d MMMM yyyy", { locale: ru })}`)
      } catch (e: any) {
        console.error(e)
        toast({
          title: "Не удалось загрузить ведомость",
          description: e?.message || "Попробуйте позже",
          variant: "destructive",
        })
        setBlocks([])
        setTitle(`Ведомость АО АП-1 на ${format(date, "d MMMM yyyy", { locale: ru })}`)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [convoyId, dateStr, dayType])

  useEffect(() => {
    if (!loading) {
      const company = "АО АП-1"
      const akText = convoyLabel ? ` (${convoyLabel})` : ""
      setTitle(`Ведомость ${company}${akText} на ${format(date, "d MMMM yyyy", { locale: ru })}`)
    }
  }, [convoyLabel, date, loading])

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>&larr; Назад</Button>
          <h1 className="text-2xl font-bold text-sky-700">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateStr}
            onChange={(e) => {
              const v = e.target.value // "YYYY-MM-DD"
              setDate(new Date(v + "T00:00:00"))
            }}
            className="border rounded-md px-2 py-1 text-sm"
          />
          <Button variant="outline" onClick={() => window.print()}>Печать</Button>
        </div>
      </div>

      <p className="text-gray-600 mb-4">Сегодня: {prettyDate}</p>

      {loading ? (
        <div className="text-gray-500">Загрузка…</div>
      ) : blocks.length === 0 ? (
        <div className="text-gray-500">Нет данных по ведомости на выбранную дату.</div>
      ) : (
        <div className="space-y-8 print:space-y-4">
          {blocks.map((block) => {
            const rows = block.rows
            const rowSpanForRoute = rows.length + 1 // + строка "Итого"

            return (
              <div
                key={`route-${block.routeNumber}`}
                className="bg-white rounded-lg overflow-hidden border print:rounded-none print:border-black"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-gray-50">
                      <tr className="text-left">
                        <th className="border px-2 py-1 w-12"></th>
                        <th className="border px-2 py-1">№</th>
                        <th className="border px-2 py-1">Гос. номер</th>
                        <th className="border px-2 py-1">Гар. номер</th>
                        <th className="border px-2 py-1">Таб. номер</th>
                        <th className="border px-2 py-1 text-right" title="Плановые обороты">План</th>
                        <th className="border px-2 py-1 text-right" title="Фактические обороты">Факт</th>
                        <th className="border px-2 py-1 text-right" title="Со слов водителей">Вод.</th>
                        <th className="border px-2 py-1 text-right">Сходы</th>
                        <th className="border px-2 py-1 text-right">ОБ</th>
                        <th className="border px-2 py-1">Примечание</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((r, idx) => (
                        <tr key={r.dispatchBusLineId ?? `${block.routeNumber}-${idx}`} className="odd:bg-white even:bg-gray-50">
                          {idx === 0 && (
                            <td
                              rowSpan={rowSpanForRoute}
                              className="border font-bold text-xl text-center align-middle px-2"
                              style={{ width: 48 }}
                            >
                              {block.routeNumber}
                            </td>
                          )}

                          <td className="border px-2 py-1 text-center w-20">{r.busLineNumber}</td>
                          <td className="border px-2 py-1">{r.govNumber}</td>
                          <td className="border px-2 py-1">{r.garageNumber}</td>
                          <td className="border px-2 py-1">{r.tabNumber}</td>

                          <td className="border px-2 py-1 text-right tabular-nums">{fmtNum(r.planRevolutions)}</td>
                          <td className="border px-2 py-1 text-right tabular-nums">{fmtNum(r.factRevolutions)}</td>
                          <td className="border px-2 py-1 text-right tabular-nums">{fmtNum(r.spokenRevolutions)}</td>

                          <td className="border px-2 py-1 text-right">{r.dropNotes ?? ""}</td>
                          <td className="border px-2 py-1 text-right">{r.ob ?? ""}</td>
                          <td className="border px-2 py-1">{r.note ?? ""}</td>
                        </tr>
                      ))}

                      <tr className="bg-gray-100 font-semibold">
                        <td className="border px-2 py-1 text-right" colSpan={5}>Итого</td>
                        <td className="border px-2 py-1 text-right tabular-nums">{fmtNum(block.totals.plan)}</td>
                        <td className="border px-2 py-1 text-right tabular-nums">{fmtNum(block.totals.fact)}</td>
                        <td className="border px-2 py-1 text-right tabular-nums">{fmtNum(block.totals.spoken)}</td>
                        <td className="border px-2 py-1" colSpan={3}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
