import { RouteStatus } from "@/types/route.types"

export function getRouteStatusByDate(date: Date): RouteStatus {
  const day = date.getDay()

  switch (day) {
    case 0:
      return "Sunday"
    case 6:
      return "Saturday"
    default:
      return "Workday"
  }

  // ❗ При необходимости можешь позже добавить проверку на праздники
}
