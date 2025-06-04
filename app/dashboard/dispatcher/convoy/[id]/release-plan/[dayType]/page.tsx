"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { getDayTypeFromDate } from "../utils/dateUtils"
import { useConvoyReleasePlan } from "../../../../hooks/useConvoyReleasePlan"
import ConvoyDispatchTable from "../../../../components/ConvoyDispatchTable"
import { useConvoy } from "../../../../context/ConvoyContext"
import type { ValidDayType } from "@/types/releasePlanTypes"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"

const statusFilters = [
  { label: "Все", value: "" },
  { label: "Выпущено", value: DispatchBusLineStatus.Released.toString() },
  { label: "Не выпущены", value: DispatchBusLineStatus.Undefined.toString() },
  { label: "Снятые", value: DispatchBusLineStatus.Removed.toString() },
]

export default function ConvoyReleasePlanPage() {
  const { convoyId } = useConvoy()
  const router = useRouter()

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  const dayType: ValidDayType = useMemo(() => getDayTypeFromDate(date), [date])

  const { data, loading, error, summary } = useConvoyReleasePlan(date, convoyId ?? "", dayType, search)

  const { routeGroups = [], driverStatuses } = data ?? {}
  const totalBuses = routeGroups.reduce((sum, g) => sum + g.assignments.length, 0)

  const filteredRouteGroups = useMemo(() => {
    if (!selectedStatus || !data) return routeGroups
    const statusNum = parseInt(selectedStatus)
    return routeGroups
      .map(group => ({
        ...group,
        assignments: group.assignments.filter(a => a.status === statusNum)
      }))
      .filter(group => group.assignments.length > 0)
  }, [routeGroups, selectedStatus, data])

  if (!convoyId) {
    return <div className="text-red-500 p-6">Ошибка: не выбрана автоколонна</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* 🔙 Назад */}
      <div className="pt-4">
        <Button
          variant="link"
          onClick={() => router.push(`/dashboard/dispatcher/convoy/${convoyId}`)}
          className="text-sm p-0 text-blue-600"
        >
          ← Назад к колонне
        </Button>
      </div>

      {/* 📅 Дата */}
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

      {/* 🔍 Поиск и фильтры */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Поиск по ФИО или табельному номеру..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {statusFilters.map(f => (
            <Button
              key={f.value}
              variant={selectedStatus === f.value ? "default" : "outline"}
              onClick={() => setSelectedStatus(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 🌀 Загрузка / ошибка */}
      {loading && <p className="text-muted-foreground">Загрузка данных...</p>}
      {error && <p className="text-red-500">Ошибка: {error}</p>}

      {/* 📋 Таблица */}
      {data && (
        <ConvoyDispatchTable
          data={{ ...data, routeGroups: filteredRouteGroups }}
          convoySummary={summary ?? undefined}
          date={date}
          dayType={dayType}
          readOnlyMode={true}
          selectedStatus={selectedStatus}
          search={search}
          onlyChecked={false}
        />
      )}
    </div>
  )
}
