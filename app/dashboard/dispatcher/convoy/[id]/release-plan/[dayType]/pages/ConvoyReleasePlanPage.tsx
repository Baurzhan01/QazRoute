"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CalendarDays, Search } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { getDayTypeFromDate } from "../../utils/dateUtils"
import { useConvoyReleasePlan } from "../../../../../hooks/useConvoyReleasePlan"
import ConvoyDispatchTable from "../../../../../components/ConvoyDispatchTable"
import { useConvoy } from "../../../../../context/ConvoyContext"
import type { ValidDayType } from "@/types/releasePlanTypes"

export function ConvoyReleasePlanPage() {
  const { convoyId } = useConvoy()
  const router = useRouter()

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [search, setSearch] = useState("")   // текст в поле ввода
  const [query, setQuery] = useState("")     // текст по которому ищем

  const dayType: ValidDayType = useMemo(() => getDayTypeFromDate(date), [date])

  const { data: originalData, summary, loading, error, refetch } = useConvoyReleasePlan(
    date,
    convoyId ?? "",
    dayType
  )

  const filteredData = useMemo(() => {
    if (!originalData) return null
    if (!query.trim()) return originalData

    const q = query.toLowerCase()

    const routeGroups = originalData.routeGroups
      .map(group => ({
        ...group,
        assignments: group.assignments.filter(a =>
          a.driver?.fullName.toLowerCase().includes(q) ||
          a.driver?.serviceNumber?.toLowerCase().includes(q) ||
          a.bus?.govNumber?.toLowerCase().includes(q) ||
          a.bus?.garageNumber?.toLowerCase().includes(q)
        )
      }))
      .filter(group => group.assignments.length > 0)

    const orders = originalData.orders.filter(o =>
      o.driver?.fullName.toLowerCase().includes(q) ||
      o.driver?.serviceNumber?.toLowerCase().includes(q) ||
      o.govNumber?.toLowerCase().includes(q) ||
      o.garageNumber?.toLowerCase().includes(q)
    )

    const reserveAssignments = originalData.reserveAssignments.filter(r =>
      r.driver?.fullName.toLowerCase().includes(q) ||
      r.driver?.serviceNumber?.toLowerCase().includes(q) ||
      r.govNumber?.toLowerCase().includes(q) ||
      r.garageNumber?.toLowerCase().includes(q)
    )

    const scheduledRepairs = originalData.scheduledRepairs.filter(r =>
      r.driver?.fullName.toLowerCase().includes(q) ||
      r.driver?.serviceNumber?.toLowerCase().includes(q) ||
      r.bus?.govNumber?.toLowerCase().includes(q) ||
      r.bus?.garageNumber?.toLowerCase().includes(q)
    )

    return {
      ...originalData,
      routeGroups,
      orders,
      reserveAssignments,
      scheduledRepairs,
    }
  }, [originalData, query])

  if (!convoyId) {
    return <div className="text-red-500 p-6">Ошибка: не выбрана автоколонна</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Назад */}
      <div className="pt-4">
        <Button
          variant="link"
          onClick={() => router.push(`/dashboard/dispatcher/convoy/${convoyId}`)}
          className="text-sm p-0 text-blue-600"
        >
          ← Назад к колонне
        </Button>
      </div>

      {/* Дата */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-sky-800 tracking-tight">
            📅 План выпуска — {format(new Date(date), "d MMMM yyyy", { locale: ru })}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {
              dayType === "workday" ? "Будний день" :
              dayType === "saturday" ? "Суббота" :
              dayType === "sunday" ? "Воскресенье" :
              "Праздничный день"
            }
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

      {/* Фильтр */}
      <Card className="p-4 border space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Search className="text-muted-foreground" />
          <Input
            placeholder="Поиск по ФИО, табельному номеру или автобусу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={() => setQuery(search.trim())}>Найти</Button>
          <Button variant="ghost" onClick={() => { setSearch(""); setQuery(""); }}>
            Очистить
          </Button>
        </div>
      </Card>

      {/* Статус */}
      {loading && <p className="text-muted-foreground">Загрузка данных...</p>}
      {error && <p className="text-red-500">Ошибка: {error}</p>}

      {/* Таблица */}
      {filteredData && (
        <ConvoyDispatchTable
          data={filteredData}
          convoySummary={summary ?? undefined}
          date={date}
          dayType={dayType}
          search={query}
          readOnlyMode={true}
          onReload={() => refetch()}
        />
      )}
    </div>
  )
}
