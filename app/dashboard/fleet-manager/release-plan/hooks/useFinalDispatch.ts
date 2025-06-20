"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { releasePlanService } from "@/service/releasePlanService"
import { convoyService } from "@/service/convoyService"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import { format } from "date-fns"
import { getAuthData } from "@/lib/auth-utils"
import type { FinalDispatchData, ValidDayType } from "@/types/releasePlanTypes"

interface UseFinalDispatchResult {
  finalDispatch: FinalDispatchData | null
  convoySummary?: {
    totalDrivers?: number
    totalBuses?: number
    driverOnWork?: number
    busOnWork?: number
  }
  convoyNumber?: number
  driversCount: number
  busesCount: number
  orderAssignments: {
    id: string
    sequenceNumber: number
    departureTime: string
    scheduleTime: string
    endTime: string
    garageNumber: string
    govNumber: string
    busId: string | null
    driver?: {
      id: string
      fullName: string
      serviceNumber: string
    }
    additionalInfo: string
  }[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFinalDispatch(
  date: Date | null,
  dayType?: ValidDayType,
  convoyIdOverride?: string
): UseFinalDispatchResult {
  const dateStr = useMemo(() => (date ? format(date, "yyyy-MM-dd") : ""), [date])
  const auth = getAuthData()
  const convoyId = convoyIdOverride ?? auth?.convoyId

  const routeStatusMap: Record<ValidDayType, string> = {
    workday: "Workday",
    saturday: "Saturday",
    sunday: "Sunday",
    holiday: "Holiday",
  }

  function formatDriverName(fullName?: string, serviceNumber?: string) {
    if (!fullName) return "—"
    const [last, first = "", middle = ""] = fullName.split(" ")
    const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
    const nameShort = `${last} ${initials}`
    return serviceNumber ? `${nameShort} (№ ${serviceNumber})` : nameShort
  }

  const routeStatus = dayType ? routeStatusMap[dayType] : undefined

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["finalDispatch", dateStr, convoyId, routeStatus],
    enabled: !!dateStr && !!convoyId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
    queryFn: async () => {
      if (!convoyId || !dateStr) throw new Error("convoyId или дата отсутствуют")

      const [
        dispatchRes,
        reserveRes,
        summaryRes,
        convoyDetailsRes,
        weekendDriversRes,
        weekendBusesRes,
        sickLeaveDriversRes,
        vacationDriversRes,
        internDriversRes,
        repairBusesRes,
        orderRes,
      ] = await Promise.all([
        releasePlanService.getFullDispatchByDate(dateStr, convoyId, routeStatus),
        releasePlanService.getReserveAssignmentsByDate(dateStr, convoyId),
        convoyService.getConvoySummary(convoyId, dateStr),
        convoyService.getById(convoyId),
        driverService.getWeekendDrivers(dateStr, convoyId),
        busService.getWeekendBuses(dateStr, convoyId),
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
        releasePlanService.getReserveAssignmentsByDate(dateStr, convoyId, "Order"),
      ])

      const convoyNumber = convoyDetailsRes.isSuccess ? convoyDetailsRes.value?.number : undefined

      const rawRoutes = (dispatchRes.value as any)?.routes ?? []
      const routeGroups = rawRoutes.map((route: any) => ({
        routeId: route.routeId,
        routeNumber: route.routeNumber,
        assignments: (route.busLines ?? []).map((bl: any) => ({
          dispatchBusLineId: bl.dispatchBusLineId,
          busLineNumber: bl.busLineNumber ?? "—",
          garageNumber: bl.bus?.garageNumber ?? "—",
          stateNumber: bl.bus?.govNumber ?? "—",
          driver: bl.firstDriver
            ? { fullName: bl.firstDriver.fullName, serviceNumber: bl.firstDriver.serviceNumber }
            : null,
          shift2Driver: bl.secondDriver
            ? { fullName: bl.secondDriver.fullName, serviceNumber: bl.secondDriver.serviceNumber }
            : undefined,
          departureTime: bl.exitTime ?? "—",
          scheduleTime: bl.scheduleStart ?? "—",
          endTime: bl.endTime ?? "—",
          additionalInfo: bl.description ?? "",
          shift2AdditionalInfo: bl.shift2AdditionalInfo ?? "",
        })),
      }))

      const reserveAssignments = (reserveRes.value ?? []).map((r: any, index: number) => ({
        id: r.id,
        dispatchBusLineId: r.dispatchBusLineId,
        sequenceNumber: r.sequenceNumber ?? index + 1,
        garageNumber: r.garageNumber ?? "",
        govNumber: r.govNumber ?? "",
        driver: r.driver ?? {
          fullName: r.driverFullName ?? "",
          serviceNumber: r.driverTabNumber ?? "",
        },
        additionalInfo: r.description ?? "",
        endTime: r.endTime ?? "",
        departureTime: r.departureTime ?? "",
        scheduleTime: r.scheduleTime ?? "",
        isReplace: r.isReplace ?? false,
      }))

      const orderAssignments = (orderRes.value ?? []).map((r: any, i: number) => ({
        id: r.id,
        sequenceNumber: r.sequenceNumber ?? i + 1,
        departureTime: r.departureTime ?? "—",
        scheduleTime: r.scheduleTime ?? "—",
        endTime: r.endTime ?? "—",
        garageNumber: r.garageNumber ?? "—",
        govNumber: r.govNumber ?? "—",
        busId: r.busId ?? null,
        driver: r.driverTabNumber
          ? {
              id: r.driverId,
              fullName: r.driverFullName,
              serviceNumber: r.driverTabNumber,
            }
          : undefined,
        additionalInfo: r.description ?? "",
      }))

      const finalDispatch: FinalDispatchData = {
        date: dateStr,
        routeGroups,
        reserveAssignments,
        repairBuses: repairBusesRes.items?.map(b => `${b.garageNumber} (${b.govNumber})`) ?? [],
        dayOffBuses: weekendBusesRes.value?.map(b => `${b.garageNumber} (${b.govNumber})`) ?? [],
        driverStatuses: {
          OnSickLeave: sickLeaveDriversRes.value?.items?.map(d => formatDriverName(d.fullName, d.serviceNumber)) ?? [],
          OnVacation: vacationDriversRes.value?.items?.map(d => formatDriverName(d.fullName, d.serviceNumber)) ?? [],
          Intern: internDriversRes.value?.items?.map(d => formatDriverName(d.fullName, d.serviceNumber)) ?? [],
          DayOff: weekendDriversRes.value?.map(d => formatDriverName(d.fullName, d.serviceNumber)) ?? [],
          total: undefined,
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

      const driversCount = uniqueDrivers.size
      const busesCount = uniqueBuses.size

      const convoySummary = summaryRes.isSuccess && summaryRes.value
        ? {
            driverOnWork: summaryRes.value.driverOnWork,
            busOnWork: summaryRes.value.busOnWork,
            totalDrivers: summaryRes.value.totalDrivers,
            totalBuses: summaryRes.value.totalBuses,
          }
        : undefined

      return {
        finalDispatch,
        convoySummary,
        convoyNumber,
        driversCount,
        busesCount,
        orderAssignments,
      }
    },
  })

  return {
    finalDispatch: data?.finalDispatch ?? null,
    convoySummary: data?.convoySummary,
    convoyNumber: data?.convoyNumber ?? undefined,
    driversCount: data?.driversCount ?? 0,
    busesCount: data?.busesCount ?? 0,
    orderAssignments: data?.orderAssignments ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  }
}
