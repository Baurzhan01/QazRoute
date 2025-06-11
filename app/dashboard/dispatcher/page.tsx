"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthData } from "@/lib/auth-utils"
import { convoyService } from "@/service/convoyService"
import { driverService } from "@/service/driverService"
import { busService } from "@/service/busService"
import { routeService } from "@/service/routeService"
import type { Convoy } from "@/types/convoy.types"
import ConvoySummaryCard from "./components/ConvoySummaryCard"

interface ConvoySummary {
  id: string
  number: number
  driverCount: number
  busCount: number
  routeCount: number
}

export default function DispatcherDashboardPage() {
  const router = useRouter()
  const authData = getAuthData()
  const depotId = authData?.busDepotId || ""
  const role = authData?.role?.toLowerCase() || ""

  const [convoys, setConvoys] = useState<Convoy[]>([])
  const [summaries, setSummaries] = useState<ConvoySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!depotId) {
      console.warn("❌ Нет depotId, пропускаем загрузку")
      setLoading(false)
      return
    }

    if (role !== "dispatcher") {
      console.warn("❌ Недостаточно прав, роль:", role)
      router.push("/login")
      return
    }

    const load = async () => {
      try {
        console.log("🔄 Загружаем колонны для депо:", depotId)
        const convoysRes = await convoyService.getByDepotId(depotId)

        if (!convoysRes.isSuccess || !Array.isArray(convoysRes.value)) {
          throw new Error("Ошибка при получении колонн")
        }

        const convoyList = convoysRes.value
        setConvoys(convoyList)

        const allSummaries: ConvoySummary[] = await Promise.all(
          convoyList.map(async (convoy) => {
            try {
              const [driversRes, busesRes, routesRes] = await Promise.all([
                driverService.filter({
                  convoyId: convoy.id,
                  fullName: null,
                  serviceNumber: null,
                  address: null,
                  phone: null,
                  driverStatus: null,
                  page: 1,
                  pageSize: 1,
                }),
                busService.getByConvoy(convoy.id),
                routeService.getByConvoyId(convoy.id),
              ])

              return {
                id: convoy.id,
                number: convoy.number,
                driverCount: driversRes.value?.totalCount ?? 0,
                busCount: Array.isArray(busesRes) ? busesRes.length : 0,
                routeCount: Array.isArray(routesRes.value) ? routesRes.value.length : 0,
              }
            } catch (innerError) {
              console.warn("⚠️ Ошибка при загрузке данных для колонны", convoy.id, innerError)
              return {
                id: convoy.id,
                number: convoy.number,
                driverCount: 0,
                busCount: 0,
                routeCount: 0,
              }
            }
          })
        )

        setSummaries(allSummaries)
        setError(null)
      } catch (err: any) {
        console.error("❌ Ошибка при загрузке колонн:", err)
        setError(err.message || "Ошибка загрузки колонн")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [depotId, role, router])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Панель диспетчера</h1>

      {loading && (
        <div className="text-center text-gray-500">Загрузка колонн...</div>
      )}

      {error && (
        <div className="text-center text-red-600">{error}</div>
      )}

      {!loading && summaries.length === 0 && (
        <div className="text-gray-500 col-span-full text-center">
          Нет доступных автоколонн или данные не найдены.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((summary) => (
          <ConvoySummaryCard
            key={summary.id}
            convoyNumber={summary.number}
            driverCount={summary.driverCount}
            busCount={summary.busCount}
            routeCount={summary.routeCount}
            onManage={() => router.push(`/dashboard/dispatcher/convoy/${summary.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
