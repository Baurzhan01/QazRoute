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
        garageNumber: line.bus?.garageNumber ?? "—",
        stateNumber: line.bus?.govNumber ?? "—",
        driver: line.firstDriver
          ? {
              serviceNumber: line.firstDriver.serviceNumber ?? "—",
              fullName: line.firstDriver.fullName ?? "—"
            }
          : null,
        departureTime: line.exitTime ?? "—",
        scheduleTime: line.scheduleStart ?? "—",
        additionalInfo: line.additionalInfo ?? "—",
        shift2Driver: line.secondDriver
          ? {
              serviceNumber: line.secondDriver.serviceNumber ?? "—",
              fullName: line.secondDriver.fullName ?? "—"
            }
          : undefined,
        endTime: line.endTime ?? "—"
      }))
    }))
  
    const reserveAssignments: ReserveAssignment[] = (raw.reserves ?? []).map((r: any, index: number) => ({
      sequenceNumber: index + 1,
      garageNumber: r.garageNumber ?? "—",
      stateNumber: r.govNumber ?? "—",
      driver: {
        personnelNumber: r.driverTabNumber ?? "—", // 🟢 Корректно сопоставляем поле
        fullName: r.driverFullName ?? "—"
      },
      departureTime: "—",
      scheduleTime: "—",
      additionalInfo: "",
      shift2Driver: undefined,
      endTime: "—"
    }))
  
    return {
      date: raw.date ?? new Date().toISOString(),
      routeGroups,
      reserveAssignments
    }
  }
  