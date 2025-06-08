"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CalendarDays, Search } from "lucide-react"
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

  const { data, loading, error, summary, refetch } = useConvoyReleasePlan(date, convoyId ?? "", dayType, search)

  const { routeGroups = [], driverStatuses } = data ?? {}
  const totalBuses = routeGroups.reduce((sum, g) => sum + g.assignments.length, 0)

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

      {/* 📅 Дата и Заголовок */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-sky-800 tracking-tight">
            📅 План выпуска — {format(new Date(date), "d MMMM yyyy", { locale: ru })}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {dayType === "workday" ? "Будний день" : dayType === "saturday" ? "Суббота" : dayType === "sunday" ? "Воскресенье" : "Праздничный день"}
          </p>
        </div>
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

      {/* 🔍 Фильтры */}
      <Card className="p-4 border space-y-4">
        <div className="flex items-center gap-3">
          <Search className="text-muted-foreground" />
          <Input
            placeholder="Поиск по ФИО, табельному номеру или автобусу..."
            value={search}
            onChange={(e) => {
              const value = e.target.value
              setSearch(value)
              if (selectedStatus) setSelectedStatus("") // сброс фильтра статуса при любом вводе
              if (value === "") refetch()               // ⬅️ авто-refetch при очистке поиска
            }}
            className="max-w-md"
          />
        </div>
      </Card>
      {/* 🌀 Загрузка / ошибка */}
      {loading && <p className="text-muted-foreground">Загрузка данных...</p>}
      {error && <p className="text-red-500">Ошибка: {error}</p>}

      {/* 📋 Таблица */}
      {data && (
        <ConvoyDispatchTable
          data={data}
          convoySummary={summary ?? undefined}
          date={date}
          dayType={dayType}
          readOnlyMode={true}
          selectedStatus={selectedStatus}
          search={search}
          onlyChecked={false}
          onReload={() => refetch()}
        />
      )}
    </div>
  )
}
