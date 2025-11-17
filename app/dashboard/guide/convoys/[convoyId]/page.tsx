"use client"

import { startTransition, useDeferredValue, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CalendarDays, Search } from "lucide-react"

import { getDayTypeFromDate } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/dateUtils"
import { useConvoyReleasePlan } from "@/app/dashboard/dispatcher/hooks/useConvoyReleasePlan"
import ConvoyDispatchTable from "@/app/dashboard/dispatcher/components/ConvoyDispatchTable"
import type { ValidDayType } from "@/types/releasePlanTypes"

export default function GuideConvoyReleasePlanPage({
  params,
}: {
  params: { convoyId: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const convoyId = params?.convoyId || ""

  const initialDate = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const [date, setDate] = useState(initialDate)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")

  const dayType: ValidDayType = useMemo(() => getDayTypeFromDate(date), [date])

  const { data: originalData, summary, loading, error, refetch } = useConvoyReleasePlan(
    date,
    convoyId,
    dayType
  )

  const filteredData = useMemo(() => {
    if (!originalData) return null
    if (!query.trim()) return originalData

    const q = query.toLowerCase()
    const lc = (s?: string | null) => (s ?? "").toLowerCase()

    const routeGroups = originalData.routeGroups
      .map((group) => ({
        ...group,
        assignments: group.assignments.filter(
          (a) =>
            lc(a.driver?.fullName).includes(q) ||
            lc(a.driver?.serviceNumber).includes(q) ||
            lc(a.bus?.govNumber).includes(q) ||
            lc(a.bus?.garageNumber).includes(q)
        ),
      }))
      .filter((group) => group.assignments.length > 0)

    const orders = originalData.orders.filter(
      (o) =>
        lc(o.driver?.fullName).includes(q) ||
        lc(o.driver?.serviceNumber).includes(q) ||
        lc(o.govNumber).includes(q) ||
        lc(o.garageNumber).includes(q)
    )

    const reserveAssignments = originalData.reserveAssignments.filter(
      (r) =>
        lc(r.driver?.fullName).includes(q) ||
        lc(r.driver?.serviceNumber).includes(q) ||
        lc(r.govNumber).includes(q) ||
        lc(r.garageNumber).includes(q)
    )

    const scheduledRepairs = originalData.scheduledRepairs.filter(
      (r) =>
        lc(r.driver?.fullName).includes(q) ||
        lc(r.driver?.serviceNumber).includes(q) ||
        lc(r.bus?.govNumber).includes(q) ||
        lc(r.bus?.garageNumber).includes(q)
    )

    return {
      ...originalData,
      routeGroups,
      orders,
      reserveAssignments,
      scheduledRepairs,
    }
  }, [originalData, query])

  const deferredData = useDeferredValue(filteredData)
  const displayDateStr = useMemo(
    () => format(new Date(date), "d MMMM yyyy", { locale: ru }),
    [date]
  )

  if (!convoyId) {
    return <div className="text-red-500 p-6">Ошибка: не выбрана автоколонна</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="pt-2">
        <Button
          variant="link"
          className="p-0 text-sm text-sky-600"
          onClick={() => router.push("/dashboard/guide/convoys")}
        >
          ← Назад к колоннам
        </Button>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-sky-800 tracking-tight">
            📅 План выпуска — {displayDateStr}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {dayType === "workday"
              ? "Будний день"
              : dayType === "saturday"
              ? "Суббота"
              : dayType === "sunday"
              ? "Воскресенье"
              : "Праздничный день"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              const val = e.target.value
              startTransition(() => {
                setDate(val)
                router.replace(`?date=${val}`)
              })
            }}
            className="max-w-[200px]"
          />
        </div>
      </div>

      <Card className="p-4 border space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Search className="text-muted-foreground" />
          <Input
            placeholder="Поиск по ФИО, табельному номеру или автобусу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={() => startTransition(() => setQuery(search.trim()))}>Найти</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("")
              setQuery("")
            }}
          >
            Очистить
          </Button>
        </div>
      </Card>

      {loading && <p className="text-muted-foreground">Загрузка данных...</p>}
      {error && <p className="text-red-500">Ошибка: {error}</p>}

      {deferredData && (
        <ConvoyDispatchTable
          data={deferredData}
          convoySummary={summary ?? undefined}
          date={date}
          dayType={dayType}
          search={query}
          readOnlyMode
          onReload={refetch}
        />
      )}
    </div>
  )
}
