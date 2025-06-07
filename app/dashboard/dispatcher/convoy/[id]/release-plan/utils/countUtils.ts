import type { RouteGroup, ReserveAssignment } from "@/types/releasePlanTypes"

export function countUniqueAssignments(
  routeGroups: RouteGroup[],
  reserves: ReserveAssignment[]
): { driversAssigned: number; busesAssigned: number } {
  const drivers = new Set<string>()
  const buses = new Set<string>()

  routeGroups.forEach(group => {
    group.assignments.forEach(a => {
      if (a.driver?.serviceNumber) drivers.add(a.driver.serviceNumber)
      if (a.shift2Driver?.serviceNumber) drivers.add(a.shift2Driver.serviceNumber)
      if (a.garageNumber) buses.add(a.garageNumber)
    })
  })

  reserves.forEach(r => {
    if (r.driver?.serviceNumber) drivers.add(r.driver.serviceNumber)
    if (r.garageNumber) buses.add(r.garageNumber)
  })

  return {
    driversAssigned: drivers.size,
    busesAssigned: buses.size,
  }
}
