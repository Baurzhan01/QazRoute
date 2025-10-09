"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

import { getAuthData } from "@/lib/auth-utils"
import { convoyService } from "@/service/convoyService"
import { releasePlanService } from "@/service/releasePlanService"
import { statementsService } from "@/service/statementsService"
import { countUniqueAssignments } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/countUtils"
import { getDayTypeFromDate } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/dateUtils"
import {
  DispatchBusLineStatus,
  type FullStatementData,
  type StatementRoute,
} from "@/types/releasePlanTypes"
import type { Statement } from "@/types/statement.types"

type DayType = "workday" | "saturday" | "sunday" | "holiday"

const routeStatusMap: Record<DayType, string> = {
  workday: "Workday",
  saturday: "Saturday",
  sunday: "Sunday",
  holiday: "Holiday",
}

interface AssignmentSummary {
  convoyId: string
  convoyNumber: number
  driversAssigned: number
  busesAssigned: number
  dispatchId: string | null
  routesCount: number
  busesOnLine: number
  existingStatementId: string | null
}

const RELEASED_STATUS_TEXT = "Released"

const isLineReleased = (line: StatementRoute["busLines"][number]) => {
  const status = line.status
  const releasedByStatus =
    status === RELEASED_STATUS_TEXT ||
    (typeof status === "number" && status === DispatchBusLineStatus.Released)

  return releasedByStatus || Boolean(line.isRealsed)
}

export default function FinalDispatchMainPage() {
  const router = useRouter()
  const depotId = getAuthData()?.busDepotId || ""

  const [loading, setLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [summaries, setSummaries] = useState<AssignmentSummary[]>([])

  const today = useMemo(() => new Date(), [])
  const todayStr = useMemo(() => today.toISOString().split("T")[0], [today])
  const dayType = useMemo<DayType>(() => getDayTypeFromDate(todayStr) as DayType, [todayStr])
  const formattedDate = useMemo(
    () => format(today, "d MMMM yyyy (EEEE)", { locale: ru }),
    [today]
  )

  useEffect(() => {
    const load = async () => {
      if (!depotId) {
        setSummaries([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const convoysRes = await convoyService.getByDepotId(depotId)
        const convoys: { id: string; number: number }[] = convoysRes.value || []
        const routeStatus = routeStatusMap[dayType]

        const results = await Promise.all(
          convoys.map(async convoy => {
            try {
              const [dispatchRes, statementsRes] = await Promise.all([
                releasePlanService.getFullStatementByDate(todayStr, convoy.id, routeStatus),
                statementsService.getByConvoyAndDate(convoy.id, todayStr),
              ])

              const statementData: FullStatementData | null = dispatchRes.value ?? null
              const routes: StatementRoute[] = statementData?.routes ?? []
              const dispatchId = statementData?.id ?? null

              const statements: Statement[] = statementsRes.value ?? []
              const existingStatementId = statements[0]?.id ?? null

              const { driversAssigned, busesAssigned } = countUniqueAssignments(routes, [])
              const busesOnLine = routes.reduce((acc, route) => {
                return acc + route.busLines.filter(isLineReleased).length
              }, 0)

              return {
                convoyId: convoy.id,
                convoyNumber: convoy.number,
                driversAssigned,
                busesAssigned,
                dispatchId,
                routesCount: routes.length,
                busesOnLine,
                existingStatementId,
              } as AssignmentSummary
            } catch (error) {
              console.error("load convoy error:", error)
              return {
                convoyId: convoy.id,
                convoyNumber: convoy.number,
                driversAssigned: 0,
                busesAssigned: 0,
                dispatchId: null,
                routesCount: 0,
                busesOnLine: 0,
                existingStatementId: null,
              } as AssignmentSummary
            }
          })
        )

        setSummaries(results)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [dayType, depotId, todayStr])

  const handleGenerateStatement = async (summary: AssignmentSummary) => {
    try {
      if (!summary.dispatchId) {
        toast({
          title: "Нет dispatchId",
          description: "Не удалось найти план выпуска для выбранной автоколонны.",
          variant: "destructive",
        })
        return
      }

      setGeneratingId(summary.convoyId)
      await statementsService.generate(summary.dispatchId)
      toast({ title: "Ведомость создана" })
      router.push(`/dashboard/dispatcher/convoy/${summary.convoyId}/final-dispatch`)
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Не удалось создать ведомость"
      console.error("generate statement error:", error?.response || error)
      toast({
        title: "Ошибка при создании ведомости",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-sky-700 mb-6">Итоговые ведомости по автоколоннам</h1>

      {loading ? (
        <div className="text-gray-500">Загрузка данных...</div>
      ) : summaries.length === 0 ? (
        <div className="text-gray-500">Нет доступных автоколонн</div>
      ) : (
        <div className="space-y-6">
          {summaries.map(s => (
            <div key={s.convoyId} className="border p-4 rounded-lg shadow-sm bg-white">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Автоколонна №{s.convoyNumber}
              </h2>
              <p className="text-sm text-gray-600 mb-3">Сегодня: {formattedDate}</p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 mb-4">
                <p>Маршрутов: <strong>{s.routesCount}</strong></p>
                <p>На линии: <strong>{s.busesOnLine}</strong></p>
                <p>Назначено автобусов: <strong>{s.busesAssigned}</strong></p>
                <p>Назначено водителей: <strong>{s.driversAssigned}</strong></p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => router.push(`/dashboard/dispatcher/convoy/${s.convoyId}/final-dispatch`)}>
                  Открыть итоговую ведомость
                </Button>
                {!s.existingStatementId && (
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateStatement(s)}
                    disabled={!s.dispatchId || generatingId === s.convoyId}
                  >
                    {generatingId === s.convoyId ? "Создаем..." : "Сформировать ведомость"}
                  </Button>
                )}
              </div>

              {s.existingStatementId && (
                <p className="mt-2 text-xs text-emerald-600">
                  Ведомость на выбранную дату уже сформирована.
                </p>
              )}
              {!s.dispatchId && (
                <p className="mt-2 text-xs text-amber-600">
                  Не найден dispatchId для текущего плана выпуска — генерация может быть недоступна.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
