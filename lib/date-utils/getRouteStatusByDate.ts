import { RouteStatus } from "@/types/route.types"
import { holidays } from "../../app/dashboard/fleet-manager/release-plan/data/holidays"
import { format } from "date-fns"

export function getRouteStatusByDate(date: Date): RouteStatus {
  const formattedDate = format(date, "yyyy-MM-dd")

  const isHoliday = holidays.some(h => h.date === formattedDate)
  if (isHoliday) return "Holiday"

  const day = date.getDay()
  switch (day) {
    case 0:
      return "Sunday"
    case 6:
      return "Saturday"
    default:
      return "Workday"
  }
}
