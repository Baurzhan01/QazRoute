import type {
  RouteGroup,
  ReserveAssignment,
  StatementRoute,
} from "@/types/releasePlanTypes"

type CountableRoute = RouteGroup | StatementRoute

const addAssignmentsFromRoute = (
  route: CountableRoute,
  drivers: Set<string>,
  buses: Set<string>
) => {
  if ("assignments" in route) {
    route.assignments.forEach(assignment => {
      const primaryDriver = assignment.driver?.serviceNumber
      if (primaryDriver) drivers.add(primaryDriver)

      const secondaryDriver = assignment.shift2Driver?.serviceNumber
      if (secondaryDriver) drivers.add(secondaryDriver)

      if (assignment.garageNumber) buses.add(assignment.garageNumber)
    })
    return
  }

  route.busLines.forEach(line => {
    const primaryDriver = line.firstDriver?.serviceNumber
    if (primaryDriver) drivers.add(primaryDriver)

    const secondaryDriver = line.secondDriver?.serviceNumber
    if (secondaryDriver) drivers.add(secondaryDriver)

    const garageNumber = line.bus?.garageNumber
    if (garageNumber) buses.add(garageNumber)
  })
}

export function countUniqueAssignments(
  routeGroups: CountableRoute[],
  reserves: ReserveAssignment[]
): { driversAssigned: number; busesAssigned: number } {
  const drivers = new Set<string>()
  const buses = new Set<string>()

  routeGroups.forEach(route => {
    addAssignmentsFromRoute(route, drivers, buses)
  })

  reserves.forEach(reserve => {
    if (reserve.driver?.serviceNumber) drivers.add(reserve.driver.serviceNumber)
    if (reserve.garageNumber) buses.add(reserve.garageNumber)
  })

  return {
    driversAssigned: drivers.size,
    busesAssigned: buses.size,
  }
}
