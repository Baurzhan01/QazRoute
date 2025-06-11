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

export default function DispatcherDashboardPage() {
  const router = useRouter()
  const authData = getAuthData()
  const depotId = authData?.busDepotId || ""
  const role = authData?.role?.toLowerCase() || ""

  const [convoys, setConvoys] = useState<Convoy[]>([])
  const [summaries, setSummaries] = useState<
    {
      id: string
      number: number
      driverCount: number
      busCount: number
      routeCount: number
    }[]
  >([])

  useEffect(() => {
    if (!depotId) {
      console.warn("Нет depotId, пропускаем загрузку")
      return
    }

    if (role !== "dispatcher") {
      console.warn("Недостаточно прав, role:", role)
      router.push("/login")
      return
    }

    const load = async () => {
      try {
        console.log("Загружаем колонны для депо:", depotId)
        const convoysRes = await convoyService.getByDepotId(depotId)
        console.log("Ответ колонн:", convoysRes)

        const convoyList = convoysRes.value ?? []
        setConvoys(convoyList)

        const allSummaries = await Promise.all(
          convoyList.map(async (convoy) => {
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
              driverCount: driversRes.value?.totalCount || 0,
              busCount: busesRes.length,
              routeCount: routesRes.value?.length || 0,
            }
          })
        )

        setSummaries(allSummaries)
      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
      }
    }

    load()
  }, [depotId, role, router])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Панель диспетчера</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.length === 0 ? (
          <div className="text-gray-500 col-span-full text-center">
            Нет доступных автоколонн или данные ещё загружаются.
          </div>
        ) : (
          summaries.map((summary) => (
            <ConvoySummaryCard
              key={summary.id}
              convoyNumber={summary.number}
              driverCount={summary.driverCount}
              busCount={summary.busCount}
              routeCount={summary.routeCount}
              onManage={() => router.push(`/dashboard/dispatcher/convoy/${summary.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
