// DispatcherDashboardPage.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Bus, Users, ClipboardList, CalendarDays } from "lucide-react"
import { driverService } from "@/service/driverService"
import { busService } from "@/service/busService"
import { convoyService } from "@/service/convoyService"
import { releasePlanService } from "@/service/releasePlanService"
import { routeService } from "@/service/routeService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthData } from "@/lib/auth-utils"
import type { Convoy } from "@/types/convoy.types"
import ConvoySummaryCard from "./components/ConvoySummaryCard"
import { getDayTypeFromDate } from "./convoy/[id]/release-plan/utils/dateUtils"
import type { ValidDayType } from "@/types/releasePlanTypes"

export default function DispatcherDashboardPage() {
  const router = useRouter()
  const [driversCount, setDriversCount] = useState(0)
  const [busesCount, setBusesCount] = useState(0)
  const [assignmentsToday, setAssignmentsToday] = useState(0)
  const [convoySummaries, setConvoySummaries] = useState<{
    id: string
    number: number
    driverCount: number
    busCount: number
    routeCount: number
  }[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [authError, setAuthError] = useState<string | null>(null)

  const authData = getAuthData()
  const depotId = authData?.busDepotId || ""
  const today = new Date().toISOString().split("T")[0]
  const dayType: ValidDayType = getDayTypeFromDate(today)

  const dayTypeMap: Record<ValidDayType, string> = {
    workday: "Workday",
    saturday: "Saturday",
    sunday: "Sunday",
    holiday: "Holiday",
  }

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    if (!depotId || !role || role.toLowerCase() !== "dispatcher") {
      setAuthError("У вас нет доступа к панели диспетчера.")
      router.push("/login")
      return
    }
  }, [depotId, router])

  useEffect(() => {
    if (!depotId) return

    const loadData = async () => {
      try {
        const convoysResponse = await convoyService.getByDepotId(depotId)
        const convoys: Convoy[] = convoysResponse.value ?? []
        const convoyIds = convoys.map(c => c.id).filter(Boolean)

        const driversResponse = await driverService.getByDepotId(depotId)
        setDriversCount(driversResponse.value?.length || 0)

        let totalBuses = 0
        let totalAssignments = 0

        const summaries = await Promise.all(
          convoys.map(async (convoy) => {
            const [buses, allRoutes, drivers] = await Promise.all([
              busService.getByConvoy(convoy.id),
              routeService.getByConvoyId(convoy.id),
              driverService.filter({
                convoyId: convoy.id,
                fullName: null,
                serviceNumber: null,
                address: null,
                phone: null,
                driverStatus: null,
                page: 1,
                pageSize: 1,
              })
            ])

            const filteredRoutes = allRoutes.value?.filter(
              (r) => r.routeStatus === dayTypeMap[dayType]
            ) ?? []

            let routeGroups: { assignments: any[] }[] = []
            try {
              const dispatch = await releasePlanService.getFullDispatchByDate(today, convoy.id)
              routeGroups = dispatch.value?.routeGroups || []
            } catch (error: any) {
              if (error?.response?.status === 404) {
                console.warn(`Разнарядка не найдена для колонны ${convoy.id}`)
              } else {
                console.error(`Ошибка загрузки разнарядки колонны ${convoy.id}:`, error)
              }
            }

            const assignments = routeGroups.reduce((acc: number, group: { assignments: any[] }) => acc + group.assignments.length, 0)

            totalBuses += buses.length
            totalAssignments += assignments

            return {
              id: convoy.id,
              number: convoy.number,
              driverCount: drivers.value?.totalCount ?? 0,
              busCount: buses.length,
              routeCount: filteredRoutes.length,
            }
          })
        )

        setBusesCount(totalBuses)
        setAssignmentsToday(totalAssignments)
        setConvoySummaries(summaries)

      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
      }
    }

    loadData()
  }, [depotId, today, dayType])

  if (authError) {
    return <div className="p-6 text-red-600">{authError}</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Панель диспетчера</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="drivers">Водители</TabsTrigger>
          <TabsTrigger value="buses">Автобусы</TabsTrigger>
          <TabsTrigger value="calendar">Календарь</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" /> Водители
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{driversCount}</p>
              <p className="text-sm text-muted-foreground">в автобусном парке</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-blue-500" /> Автобусы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{busesCount}</p>
              <p className="text-sm text-muted-foreground">в автобусном парке</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-500" /> Назначения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{assignmentsToday}</p>
              <p className="text-sm text-muted-foreground">всего на {today}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Автоколонны автобусного парка</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {convoySummaries.map((summary) => (
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
        </TabsContent>

        <TabsContent value="drivers" className="mt-6">
          <p>Здесь будет список водителей автобусного парка...</p>
        </TabsContent>

        <TabsContent value="buses" className="mt-6">
          <p>Здесь будет список автобусов автобусного парка...</p>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <p>Здесь будет календарь смен и выходов по парку...</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
