"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { CalendarDays } from "lucide-react"
import { useConvoyReleasePlan } from "../../../hooks/useConvoyReleasePlan"
import FinalDispatchTable from "@/app/dashboard/fleet-manager/release-plan/components/FinalDispatchTable"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export default function ConvoyReleasePlanPage() {
  const { id } = useParams()
  const convoyId = id as string
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const { data, loading, error } = useConvoyReleasePlan(date, convoyId)

  const totalBuses = data?.routeGroups?.reduce((sum, g) => sum + g.assignments.length, 0) ?? 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-sky-700">
          План выпуска — {format(new Date(date), "d MMMM yyyy", { locale: ru })}
        </h1>
        <div className="flex items-center gap-2">
          <CalendarDays className="text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="max-w-[200px]"
          />
        </div>
      </div>

      {loading && <p className="text-muted-foreground">Загрузка данных...</p>}
      {error && <p className="text-red-500">Ошибка: {error}</p>}

      {data && (
        <FinalDispatchTable
          data={data}
          driversCount={data.driverStatuses?.total ?? 0}
          busesCount={totalBuses}
          convoySummary={{
            totalDrivers: data.driverStatuses?.total,
            driverOnWork: undefined,
            totalBuses: totalBuses,
            busOnWork: totalBuses, // При необходимости заменить на отдельное поле, если появится
          }}
          dayType="workday"
          readOnlyMode={true}
        />
      )}
    </div>
  )
}
