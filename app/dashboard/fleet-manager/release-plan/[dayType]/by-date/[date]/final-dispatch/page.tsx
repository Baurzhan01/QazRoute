"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import FinalDispatchTable from "../../../../components/FinalDispatchTable"
import FinalDispatchExport from "./components/FinalDispatchExport"
import { releasePlanService } from "@/service/releasePlanService"
import type { FinalDispatchData } from "@/types/releasePlanTypes"
import { prepareFinalDispatchData } from "../../../../utils/dispatchMapper"
import { formatDate, formatDateLabel, formatDayOfWeek } from "../../../../utils/dateUtils"
import { Button } from "@/components/ui/button"
import { getAuthData } from "@/lib/auth-utils"
import apiClient from "@/app/api/apiClient"

export default function FinalDispatchPage() {
  const [data, setData] = useState<FinalDispatchData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [depotName, setDepotName] = useState<string>("")

  const params = useParams()
  const router = useRouter()

  const dateParam = params?.date as string | undefined
  const dayType = params?.dayType as string | undefined

  const handleGoBack = () => {
    router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateParam}`)
  }

  useEffect(() => {
    const fetchDepotName = async () => {
      const authData = getAuthData()
      const depotId = authData?.busDepotId

      if (!depotId) return

      try {
        const { data } = await apiClient.get(`/bus-depots/${depotId}`)
        if (data?.isSuccess && data.value?.name) {
          setDepotName(data.value.name)
        }
      } catch (err) {
        console.error("Ошибка загрузки данных автобусного парка", err)
      }
    }

    fetchDepotName()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!dateParam) {
        setError("Дата не указана в параметрах URL")
        return
      }

      setLoading(true)
      setError(null)

      try {
        const date = new Date(dateParam)
        if (isNaN(date.getTime())) throw new Error("Некорректная дата")

        const formattedDate = formatDate(date)

        const [dispatchResult, reserveResult] = await Promise.all([
          releasePlanService.getFullDispatchByDate(formattedDate),
          releasePlanService.getReserveAssignmentsByDate(formattedDate)
        ])

        if (!dispatchResult.isSuccess || !dispatchResult.value) throw new Error(dispatchResult.error || "Ошибка загрузки разнарядки")
        if (!reserveResult.isSuccess || !reserveResult.value) throw new Error(reserveResult.error || "Ошибка загрузки резерва")

        const prepared = prepareFinalDispatchData({
          ...dispatchResult.value,
          reserves: reserveResult.value
        })

        setData(prepared)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateParam])

  const displayDate = dateParam ? new Date(dateParam) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 bg-white border-b py-4 px-6 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-3xl font-bold">
            План выпуска автобусов {depotName && `· ${depotName}`}
          </h2>
          {displayDate && (
            <p className="text-gray-600">
              {formatDayOfWeek(displayDate)}, {formatDateLabel(displayDate)}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {data && displayDate && (
            <FinalDispatchExport date={displayDate} data={data} depotName={depotName} />
          )}
          <Button variant="secondary" onClick={handleGoBack}>
            ← Назад к маршрутам
          </Button>
        </div>
      </div>

      <div className="p-6">
        {loading && <p className="text-gray-500">Загрузка данных...</p>}
        {error && <p className="text-red-500">Ошибка: {error}</p>}
        {!loading && !error && data && <FinalDispatchTable data={data}  />}
      </div>
    </div>
  )
}
