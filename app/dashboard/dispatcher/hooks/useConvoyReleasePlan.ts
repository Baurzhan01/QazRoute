import { useEffect, useState } from "react"
import { releasePlanService } from "@/service/releasePlanService"
import { convoyService } from "@/service/convoyService"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import type { FinalDispatchData, RouteGroup, ValidDayType } from "@/types/releasePlanTypes"

const routeStatusMap: Record<ValidDayType, string> = {
  workday: "Workday",
  saturday: "Saturday",
  sunday: "Sunday",
  holiday: "Holiday",
}

export function useConvoyReleasePlan(
  date: string,
  convoyId: string,
  dayType?: ValidDayType,
  search?: string
) {
  const [data, setData] = useState<FinalDispatchData | null>(null)
  const [summary, setSummary] = useState<{
    totalDrivers?: number
    totalBuses?: number
    driverOnWork?: number
    busOnWork?: number
  } | null>(null)
  const [routesCount, setRoutesCount] = useState<number>(0)
  const [driversCount, setDriversCount] = useState<number>(0)
  const [busesCount, setBusesCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!date || !convoyId) return

    const load = async () => {
      setLoading(true)
      try {
        const routeStatus = dayType ? routeStatusMap[dayType] : undefined

        const [
          dispatchRes,
          reserveRes,
          summaryRes,
          weekendDriversRes,
          weekendBusesRes,
          sickLeaveDriversRes,
          vacationDriversRes,
          internDriversRes,
          repairBusesRes,
        ] = await Promise.all([
          releasePlanService.getFullDispatchByDate(date, convoyId, routeStatus, search),
          releasePlanService.getReserveAssignmentsByDate(date, convoyId),
          convoyService.getConvoySummary(convoyId, date),
          driverService.getWeekendDrivers(date, convoyId),
          busService.getWeekendBuses(date, convoyId),
          driverService.filter({
            convoyId,
            driverStatus: "OnSickLeave",
            fullName: null,
            serviceNumber: null,
            address: null,
            phone: null,
            page: 1,
            pageSize: 100,
          }),
          driverService.filter({
            convoyId,
            driverStatus: "OnVacation",
            fullName: null,
            serviceNumber: null,
            address: null,
            phone: null,
            page: 1,
            pageSize: 100,
          }),
          driverService.filter({
            convoyId,
            driverStatus: "Intern",
            fullName: null,
            serviceNumber: null,
            address: null,
            phone: null,
            page: 1,
            pageSize: 100,
          }),
          busService.filter({
            convoyId,
            busStatus: "UnderRepair",
            page: 1,
            pageSize: 100,
          }),
        ])

        const rawRoutes = (dispatchRes.value as any)?.routes ?? []

        const routeGroups: RouteGroup[] = rawRoutes.map((route: any) => ({
          routeId: route.routeId,
          routeNumber: route.routeNumber,
          assignments: (route.busLines ?? []).map((bl: any) => ({
            dispatchBusLineId: bl.dispatchBusLineId,
            busLineNumber: bl.busLineNumber ?? "—",
            garageNumber: bl.bus?.garageNumber ?? "—",
            stateNumber: bl.bus?.govNumber ?? "—",
            driver: bl.firstDriver ?? null,
            shift2Driver: bl.secondDriver ?? undefined,
            departureTime: bl.exitTime ?? "—",
            scheduleTime: bl.scheduleStart ?? "—",
            endTime: bl.endTime ?? "—",
            additionalInfo: bl.description ?? "",
            shift2AdditionalInfo: bl.shift2AdditionalInfo ?? "",
            status: bl.status, // 👈 добавлено, если приходит с сервера
          })),
        }))

        const reserveAssignments = (reserveRes.value ?? []).map((r: any, index: number) => ({
          dispatchBusLineId: r.dispatchBusLineId,
          sequenceNumber: r.sequenceNumber ?? index + 1,
          garageNumber: r.garageNumber ?? "",
          govNumber: r.govNumber ?? "",
          driver: r.driver ?? {
            fullName: r.driverFullName ?? "",
            serviceNumber: r.driverTabNumber ?? "",
          },
          additionalInfo: r.additionalInfo ?? r.description ?? "",
          endTime: r.endTime ?? "",
          departureTime: r.departureTime ?? "",
          scheduleTime: r.scheduleTime ?? "",
          status: r.status, // 👈 если есть
        }))

        const formatName = (fullName?: string, serviceNumber?: string) => {
          if (!fullName) return "—"
          const [last, first = "", middle = ""] = fullName.split(" ")
          const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
          return serviceNumber ? `${last} ${initials} (№ ${serviceNumber})` : `${last} ${initials}`
        }

        const finalDispatch: FinalDispatchData = {
          date,
          routeGroups,
          reserveAssignments,
          repairBuses: repairBusesRes.items?.map(b => `${b.garageNumber} (${b.govNumber})`) ?? [],
          dayOffBuses: weekendBusesRes.value?.map(b => `${b.garageNumber} (${b.govNumber})`) ?? [],
          driverStatuses: {
            OnSickLeave: sickLeaveDriversRes.value?.items?.map(d => formatName(d.fullName, d.serviceNumber)) ?? [],
            OnVacation: vacationDriversRes.value?.items?.map(d => formatName(d.fullName, d.serviceNumber)) ?? [],
            Intern: internDriversRes.value?.items?.map(d => formatName(d.fullName, d.serviceNumber)) ?? [],
            DayOff: weekendDriversRes.value?.map(d => formatName(d.fullName, d.serviceNumber)) ?? [],
            total: summaryRes.value?.totalDrivers ?? undefined,
          },
        }

        const uniqueDrivers = new Set<string>()
        const uniqueBuses = new Set<string>()

        finalDispatch.routeGroups.forEach(group =>
          group.assignments.forEach(a => {
            if (a.driver?.serviceNumber) uniqueDrivers.add(a.driver.serviceNumber)
            if (a.shift2Driver?.serviceNumber) uniqueDrivers.add(a.shift2Driver.serviceNumber)
            if (a.garageNumber) uniqueBuses.add(a.garageNumber)
          })
        )

        finalDispatch.reserveAssignments.forEach(r => {
          if (r.driver?.serviceNumber) uniqueDrivers.add(r.driver.serviceNumber)
          if (r.garageNumber) uniqueBuses.add(r.garageNumber)
        })

        setDriversCount(uniqueDrivers.size)
        setBusesCount(uniqueBuses.size)
        setRoutesCount(routeGroups.length)
        setData(finalDispatch)
        setSummary({
          totalDrivers: summaryRes.value?.totalDrivers,
          totalBuses: summaryRes.value?.totalBuses,
          driverOnWork: summaryRes.value?.driverOnWork,
          busOnWork: summaryRes.value?.busOnWork,
        })
        setError(null)
      } catch (err: any) {
        console.error("Ошибка useConvoyReleasePlan:", err)
        setError(err.message || "Не удалось загрузить план выпуска")
        setData(null)
        setSummary(null)
        setRoutesCount(0)
        setDriversCount(0)
        setBusesCount(0)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [date, convoyId, dayType, search]) // 👈 добавили search в зависимости

  return {
    data,
    summary,
    routeGroups: data?.routeGroups ?? [],
    routesCount,
    driversCount,
    busesCount,
    loading,
    error,
  }
}
