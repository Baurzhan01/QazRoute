// utils/dispatchMapper.ts

import type {
    FinalDispatchData,
    RouteGroup,
    RouteAssignment,
    ReserveAssignment
  } from "@/types/releasePlanTypes"
  
  // 📦 Маппинг данных для итогового плана выпуска
  export function prepareFinalDispatchData(raw: any): FinalDispatchData {
    const routeGroups: RouteGroup[] = (raw.routes ?? []).map((route: any) => ({
      routeId: route.routeId,
      routeNumber: route.routeNumber,
      assignments: (route.busLines ?? []).map((line: any): RouteAssignment => ({
        dispatchBusLineId: line.dispatchBusLineId,
        busLineNumber: line.busLineNumber ?? line.busLine?.number ?? "",
        garageNumber: line.bus?.garageNumber ?? "—",
        stateNumber: line.bus?.govNumber ?? "—",
        driver: line.firstDriver
          ? {
              id: line.firstDriver.id ?? "",
              serviceNumber: line.firstDriver.serviceNumber ?? "—",
              fullName: line.firstDriver.fullName ?? "—"
            }
          : null,
        departureTime: line.exitTime ?? "—",
        scheduleTime: line.scheduleStart ?? "—",
        additionalInfo: line.description ?? "—",
        shift2Driver: line.secondDriver
          ? {
              id: line.secondDriver.id ?? "",
              serviceNumber: line.secondDriver.serviceNumber ?? "—",
              fullName: line.secondDriver.fullName ?? "—"
            }
          : undefined,
        endTime: line.endTime ?? "—",
        isRealsed: Boolean(line.isRealsed)
      }))
    }))
  
    const reserveAssignments: ReserveAssignment[] = (raw.reserves ?? []).map((r: any, index: number) => {
      const driver = r.driver
        ? {
            id: r.driver.id ?? "",
            serviceNumber: r.driver.serviceNumber ?? "-",
            fullName: r.driver.fullName ?? "-",
          }
        : {
            id: r.driverId ?? "",
            serviceNumber: r.driverTabNumber ?? "-",
            fullName: r.driverFullName ?? "-",
          }

      return {
        id: r.id ?? "",
        dispatchBusLineId: r.dispatchBusLineId ?? "",
        sequenceNumber: r.sequenceNumber ?? index + 1,
        garageNumber: r.garageNumber ?? "-",
        govNumber: r.govNumber ?? "-",
        driver,
        departureTime: r.departureTime ?? "-",
        scheduleTime: r.scheduleTime ?? "-",
        additionalInfo: r.description ?? "",
        isReplace: Boolean(r.isReplace),
        endTime: r.endTime ?? "-"
      }
    })
    return {
      date: raw.date ?? new Date().toISOString(),
      routeGroups,
      reserveAssignments,
      repairBuses: [],
      dayOffBuses: [],
      driverStatuses: {},
      orders: raw.orders ?? [],
      scheduledRepairs: raw.scheduledRepairs ?? []
    }
  }
  


