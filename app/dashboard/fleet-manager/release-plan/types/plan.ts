// Типы календаря и дней
export type DayType = "workday" | "saturday" | "sunday" | "holiday"

export interface CalendarDay {
  date: string     
  dayType: DayType
  isToday: boolean
  isHoliday: boolean
  holidayName?: string
}

export interface CalendarMonth {
  year: number
  month: number // 0-11
  days: CalendarDay[]
  workdays: CalendarDay[]
  saturdays: CalendarDay[]
  sundays: CalendarDay[]
  holidays: CalendarDay[]
}

// Типы маршрутов и разнарядки
export interface Route {
  id: string
  number: string
  name?: string
  order: number
  description?: string
}

// Ответ API
export interface ApiResponse<T> {
    isSuccess: boolean
    error: string | null
    statusCode: number
    value: T | null
  }

export interface Shift {
  shiftNumber: number
  departureTime: string
  scheduleTime: string
  additionalInfo?: string
}

export interface DriverAssignment {
  driverId: string
  personnelNumber: string
  firstName: string
  lastName: string
  middleName?: string
  shifts: Shift[]
}

export interface BusAssignment {
  busId: string
  garageNumber: string
  govNumber?: string
  driver?: DriverAssignment
  isReserve: boolean
  endTime?: string
}

export interface RouteDetails {
  id: string
  number: string
  name?: string
  order: number
  buses: BusAssignment[]
}

export interface DayPlan {
  date: Date
  routes: Route[]
  reserveDrivers: {
    id: string
    personnelNumber: string
    firstName: string
    lastName: string
    middleName?: string
  }[]
}

export interface FinalDispatch {
  date: Date
  routeAssignments: RouteDetails[]
  reserveDrivers: {
    id: string
    personnelNumber: string
    firstName: string
    lastName: string
    middleName?: string
  }[]
}
// Ответ API
export interface ApiResponse<T> {
  isSuccess: boolean
  error: string | null
  statusCode: number
  value: T | null
}