import type { FinalDispatchData, AssignUnplannedDispatchResponse } from "@/types/releasePlanTypes"

export function mapFinalDispatchToAssignUnplanned(data: FinalDispatchData): AssignUnplannedDispatchResponse {
  const routes = data.routeGroups?.map(route => ({
    routeId: route.routeId,
    routeNumber: route.routeNumber,
  })) ?? []

  const reserves = data.reserveAssignments?.map(res => ({
    id: res.id,
    driverId: res.driver?.id,
    driverFullName: res.driver?.fullName,
    driverTabNumber: res.driver?.serviceNumber,
    garageNumber: res.garageNumber,
    govNumber: res.govNumber,
    isReplace: res.isReplace,
    description: res.additionalInfo,
  })) ?? []

  const busLines = data.routeGroups?.flatMap(route =>
    route.assignments.map(line => ({
      dispatchBusLineId: line.dispatchBusLineId,
      busLineId: line.busLineNumber,
      busLineNumber: line.busLineNumber,
      routeId: route.routeId,
      routeNumber: route.routeNumber,
      exitTime: line.departureTime,
      endTime: line.endTime,
      firstDriver: line.driver ? {
        id: line.driver.id,
        fullName: line.driver.fullName,
        serviceNumber: line.driver.serviceNumber,
      } : null,
      bus: line.bus ? {
        id: line.bus.id,
        govNumber: line.bus.govNumber,
        garageNumber: line.bus.garageNumber,
      } : null,
    }))
  ) ?? []

  return {
    date: data.date,
    routes,
    reserves,
    busLines,
  }
}
