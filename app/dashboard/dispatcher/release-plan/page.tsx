"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { getAuthData } from "@/lib/auth-utils"
import { convoyService } from "@/service/convoyService"
import { releasePlanService } from "@/service/releasePlanService"
import { countUniqueAssignments } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/countUtils"
import { getDayTypeFromDate } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/dateUtils"
import { Button } from "@/components/ui/button"

interface Convoy {
  id: string
  number: number
}

interface AssignmentSummary {
  convoyId: string
  convoyNumber: number
  driversAssigned: number
  busesAssigned: number
}

export default function ReleasePlanMainPage() {
  const router = useRouter()
  const authData = getAuthData()
  const depotId = authData?.busDepotId || ""

  const [summaries, setSummaries] = useState<AssignmentSummary[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const dayType = getDayTypeFromDate(todayStr)
  const formattedDate = format(today, "d MMMM yyyy (EEEE)", { locale: ru })

  useEffect(() => {
    const load = async () => {
      if (!depotId) return
      const res = await convoyService.getByDepotId(depotId)
      if (!res.isSuccess || !res.value) return

      const convoys = res.value

      const results = await Promise.all(
        convoys.map(async (convoy) => {
          try {
            const dispatchRes = await releasePlanService.getFullDispatchByDate(
              todayStr,
              convoy.id,
              dayType
            )

            const routeGroups = dispatchRes.value?.routeGroups ?? []

            const { driversAssigned, busesAssigned } = countUniqueAssignments(routeGroups, [])

            return {
              convoyId: convoy.id,
              convoyNumber: convoy.number,
              driversAssigned,
              busesAssigned,
            }
          } catch {
            return {
              convoyId: convoy.id,
              convoyNumber: convoy.number,
              driversAssigned: 0,
              busesAssigned: 0,
            }
          }
        })
      )

      setSummaries(results)
      setLoading(false)
    }

    load()
  }, [depotId, todayStr, dayType])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-sky-700 mb-6">План выпуска по автоколоннам</h1>

      {loading ? (
        <div className="text-gray-500">Загрузка колонн...</div>
      ) : summaries.length === 0 ? (
        <div className="text-gray-500">Нет доступных колонн</div>
      ) : (
        <div className="space-y-6">
          {summaries.map((summary) => (
            <div
              key={summary.convoyId}
              className="border p-4 rounded-lg shadow-sm bg-white"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Автоколонна №{summary.convoyNumber}
              </h2>
              <p className="text-sm text-gray-600 mb-1">📅 Сегодня: {formattedDate}</p>
              <p className="text-sm text-gray-600 mb-1">👨‍✈️ Назначено водителей: {summary.driversAssigned}</p>
              <p className="text-sm text-gray-600 mb-3">🚌 Назначено автобусов: {summary.busesAssigned}</p>
              <Button
                onClick={() =>
                  router.push(
                    `/dashboard/dispatcher/convoy/${summary.convoyId}/release-plan/${dayType}`
                  )
                }
              >
                ➡ Перейти к плану выпуска
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
