import { useEffect, useState, useCallback } from "react"
import { releasePlanService } from "@/service/releasePlanService"
import { convoyService } from "@/service/convoyService"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import { repairService } from "@/service/repairService"
import { format } from "date-fns"
import type { DriverStatus } from "@/types/driver.types" // путь может отличаться
import type { FinalDispatchData, RouteGroup, ValidDayType, OrderAssignment } from "@/types/releasePlanTypes"
import type { ConvoySummary } from "@/types/convoy.types"
import type { RepairRecord } from "@/app/dashboard/repairs/planned/hooks/usePlannedRepairs"
import { countUniqueAssignments } from "../convoy/[id]/release-plan/utils/countUtils"

const routeStatusMap: Record<ValidDayType, string> = {
  workday: "Workday",
  saturday: "Saturday",
  sunday: "Sunday",
  holiday: "Holiday",
}

const statusMap: Record<string, number> = {
  Undefined: 0,
  Released: 1,
  Replaced: 2,
  Permutation: 3,
  Removed: 4,
}

export function useConvoyReleasePlan(
  date: string,
  convoyId: string,
  dayType?: ValidDayType,
  search?: string
) {
  const [data, setData] = useState<FinalDispatchData | null>(null)
  const [summary, setSummary] = useState<ConvoySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routesCount, setRoutesCount] = useState(0)
  const [driversCount, setDriversCount] = useState(0)
  const [busesCount, setBusesCount] = useState(0)

  const load = useCallback(async () => {
    if (!date || !convoyId) return

    setLoading(true)
    try {
      const routeStatus = dayType ? routeStatusMap[dayType] : undefined

      const [
        dispatchRes,
        reserveRes,
        summaryRes,
        weekendDriversRes,
        weekendBusesRes,
        orderRes,
        plannedRepairsRes,
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
        releasePlanService.getReserveAssignmentsByDate(date, convoyId, "Order"),
        repairService.getRepairsByDate(date, convoyId),
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
      const lowerSearch = search?.toLowerCase().trim()

      const routeGroups: RouteGroup[] = rawRoutes.map((route: any) => {
        let busLines = route.busLines ?? []

        if (lowerSearch) {
          busLines = busLines.filter((bl: any) => {
            const fullName = bl.firstDriver?.fullName?.toLowerCase() ?? ""
            const serviceNumber = bl.firstDriver?.serviceNumber ?? ""
            const garage = bl.bus?.garageNumber?.toLowerCase() ?? ""
            const gov = bl.bus?.govNumber?.toLowerCase() ?? ""
            return (
              fullName.includes(lowerSearch) ||
              serviceNumber.includes(lowerSearch) ||
              garage.includes(lowerSearch) ||
              gov.includes(lowerSearch)
            )
          })
        }

        return {
          routeId: route.routeId,
          routeNumber: route.routeNumber,
          assignments: busLines.map((bl: any) => {
            const normalizedStatus = typeof bl.status === "string" ? statusMap[bl.status] ?? 0 : bl.status ?? 0
            return {
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
              status: normalizedStatus,
              isRealsed: bl.isRealsed ?? false,
              releasedTime: bl.releasedTime ?? "",
              fuelAmount: bl.normSolarium ?? "",
              bus: bl.bus ?? undefined,
            }
          })
        }
      }).filter((group: RouteGroup) => group.assignments.length > 0)

      const reserveAssignments = (reserveRes.value ?? [])
      .map((r: any, index: number) => ({
        id: r.id ?? `reserve-${index}`,
        dispatchBusLineId: r.dispatchBusLineId,
        sequenceNumber: r.sequenceNumber ?? index + 1,
        garageNumber: r.garageNumber ?? "",
        govNumber: r.govNumber ?? "",
        driver: r.driver ?? {
          fullName: r.driverFullName ?? "",
          serviceNumber: r.driverTabNumber ?? "",
          id: r.driverId ?? `driver-${index}`,
        },
        additionalInfo: r.additionalInfo ?? r.description ?? "",
        endTime: r.endTime ?? "",
        departureTime: r.departureTime ?? "",
        scheduleTime: r.scheduleTime ?? "",
        status: r.status,
        isReplace: r.status === 2,
      }))
      .filter((r) => {
        if (!lowerSearch) return true
        return (
          r.driver?.fullName?.toLowerCase().includes(lowerSearch) ||
          r.driver?.serviceNumber?.includes(lowerSearch) ||
          r.garageNumber.toLowerCase().includes(lowerSearch) ||
          r.govNumber.toLowerCase().includes(lowerSearch)
        )
      })    

      const orderAssignments: OrderAssignment[] = (orderRes.value ?? [])
      .map((r: any, i: number) => ({
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
      .filter((r) => {
        if (!lowerSearch) return true
        return (
          r.driver?.fullName?.toLowerCase().includes(lowerSearch) ||
          r.driver?.serviceNumber?.includes(lowerSearch) ||
          r.garageNumber.toLowerCase().includes(lowerSearch) ||
          r.govNumber.toLowerCase().includes(lowerSearch)
        )
      })


      const scheduledRepairs: RepairRecord[] = (plannedRepairsRes?.value ?? [])
      .map((entry: any) => ({
        id: entry.id,
        bus: {
          id: entry.bus.id,
          govNumber: entry.bus.govNumber,
          garageNumber: entry.bus.garageNumber,
          busStatus: "OnWork",
          isAssigned: false,
          isBusy: false,
        },
        driver: {
          id: entry.driver.id,
          fullName: entry.driver.fullName,
          serviceNumber: entry.driver.serviceNumber,
          driverStatus: "OnWork" as DriverStatus,
          isAssigned: false,
          isBusy: false,
        },
        description: entry.description,
      }))
      .filter((r) => {
        if (!lowerSearch) return true
        return (
          r.driver.fullName.toLowerCase().includes(lowerSearch) ||
          r.driver.serviceNumber.includes(lowerSearch) ||
          r.bus.garageNumber.toLowerCase().includes(lowerSearch) ||
          r.bus.govNumber.toLowerCase().includes(lowerSearch)
        )
      })

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
        orders: orderAssignments,
        scheduledRepairs,
      }

      const { driversAssigned, busesAssigned } = countUniqueAssignments(routeGroups, reserveAssignments)
      setDriversCount(driversAssigned)
      setBusesCount(busesAssigned)
      setRoutesCount(routeGroups.length)
      setData(finalDispatch)
      setSummary(summaryRes.value ?? null)
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
  }, [date, convoyId, dayType, search])

  useEffect(() => {
    load()
  }, [load])

  return {
    data,
    summary,
    routeGroups: data?.routeGroups ?? [],
    routesCount,
    driversAssigned: driversCount,
    busesAssigned: busesCount,
    loading,
    error,
    refetch: load,
  }
}
