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
      if (!depotId) return
      setLoading(true)
      try {
        const convoysRes = await convoyService.getByDepotId(depotId)
        const convoys: { id: string; number: number }[] = convoysRes.value || []

        const routeStatus = routeStatusMap[dayType]

        const results = await Promise.all(
          convoys.map(async (convoy) => {
            try {
              // Новая ручка ведомости
              const dispatchRes = await releasePlanService.getFullStatementByDate(
                todayStr,
                convoy.id,
                routeStatus
              )

              const v: any = dispatchRes.value ?? {}
              const dispatchId: string | null =
                v?.id ?? v?.dispatchId ?? v?.dispatch?.id ?? null

              const rawRoutes = (v?.routes ?? []) as any[]
              const routeGroups = rawRoutes.map((route: any) => ({
                routeId: route.routeId,
                routeNumber: route.routeNumber,
                assignments: (route.busLines ?? []).map((bl: any) => ({
                  dispatchBusLineId: bl.dispatchBusLineId,
                  busLineNumber: bl.busLineNumber ?? "—",
                  garageNumber: bl.bus?.garageNumber ?? "—",
                  stateNumber: bl.bus?.govNumber ?? "—",
                  driver: bl.firstDriver ?? null,
                  shift2Driver: bl.secondDriver ?? undefined,
                  departureTime: bl.exitTime ?? "—",
                  scheduleTime: bl.scheduleStart ?? "—",
                  endTime: bl.endTime ?? "—",
                  additionalInfo: bl.description ?? "",
                  routeNumber: route.routeNumber,
                  bus: bl.bus ?? undefined,
                })),
              }))

              const { driversAssigned, busesAssigned } = countUniqueAssignments(
                routeGroups,
                []
              )

              return {
                convoyId: convoy.id,
                convoyNumber: convoy.number,
                driversAssigned,
                busesAssigned,
                dispatchId,
              } as AssignmentSummary
            } catch (e) {
              console.error("load convoy error:", e)
              return {
                convoyId: convoy.id,
                convoyNumber: convoy.number,
                driversAssigned: 0,
                busesAssigned: 0,
                dispatchId: null,
              } as AssignmentSummary
            }
          })
        )

        setSummaries(results)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [depotId, dayType, todayStr])

  const handleGenerateStatement = async (summary: AssignmentSummary) => {
    try {
      if (!summary.dispatchId) {
        toast({
          title: "Не найден dispatchId",
          description: "Сначала откройте/обновите разнарядку по этой колонне.",
          variant: "destructive",
        })
        return
      }
      setGeneratingId(summary.convoyId)
      await statementsService.generate(summary.dispatchId)
      toast({ title: "Ведомость сформирована" })
      router.push(`/dashboard/dispatcher/convoy/${summary.convoyId}/final-dispatch`)
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Попробуйте позже"
      console.error("generate statement error:", e?.response || e)
      toast({
        title: "Ошибка при формировании",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-sky-700 mb-6">Ведомость по автоколоннам</h1>

      {loading ? (
        <div className="text-gray-500">Загрузка колонн…</div>
      ) : summaries.length === 0 ? (
        <div className="text-gray-500">Нет доступных колонн</div>
      ) : (
        <div className="space-y-6">
          {summaries.map((s) => (
            <div key={s.convoyId} className="border p-4 rounded-lg shadow-sm bg-white">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Автоколонна №{s.convoyNumber}
              </h2>
              <p className="text-sm text-gray-600 mb-1">📅 Сегодня: {formattedDate}</p>
              <p className="text-sm text-gray-600 mb-1">👨‍✈️ Назначено водителей: {s.driversAssigned}</p>
              <p className="text-sm text-gray-600 mb-3">🚌 Назначено автобусов: {s.busesAssigned}</p>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => router.push(`/dashboard/dispatcher/convoy/${s.convoyId}/final-dispatch`)}>
                  ➡ Открыть ведомость
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateStatement(s)}
                  disabled={!s.dispatchId || generatingId === s.convoyId}
                >
                  {generatingId === s.convoyId ? "Формируем…" : "Сформировать ведомость"}
                </Button>
              </div>
              {!s.dispatchId && (
                <p className="mt-2 text-xs text-amber-600">
                  Для этой колонны не найден текущий dispatchId — проверьте план выпуска на сегодня.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
