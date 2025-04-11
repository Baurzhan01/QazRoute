// Типы для календаря и дней
export type DayType = "workday" | "saturday" | "sunday" | "holiday"

export interface CalendarDay {
  date: string // формат YYYY-MM-DD
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

// Типы для маршрутов и разнарядки
export interface Route {
  id: string
  number: string
  name?: string
  order: number
  description?: string
}

export interface Shift {
  shiftNumber: number
  departureTime: string // формат HH:MM
  scheduleTime: string // формат HH:MM
  additionalInfo?: string
}

export interface Driver {
  id: string
  personnelNumber: string
  firstName: string
  lastName: string
  middleName?: string
  status: "Active" | "OnVacation" | "Sick" | "Suspended"
}

export interface Bus {
  id: string
  garageNumber: string
  govNumber?: string
  status: "OnWork" | "UnderRepair" | "LongTermRepair" | "DayOff" | "Decommissioned"
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
  id?: string // ID назначения (если уже существует)
  busId: string
  garageNumber: string
  govNumber?: string
  driver?: DriverAssignment
  isReserve: boolean
  endTime?: string // формат HH:MM
  departureNumber: number // номер выхода
  additionalInfo?: string
}

export interface ReserveAssignment {
  id?: string // ID назначения (если уже существует)
  busId: string
  garageNumber: string
  govNumber?: string
  driverId?: string
  personnelNumber?: string
  firstName?: string
  lastName?: string
  middleName?: string
  departureTime: string // формат HH:MM
  scheduleTime: string // формат HH:MM
  additionalInfo?: string
  endTime?: string // формат HH:MM
  sequenceNumber: number // порядковый номер в резерве
}

export interface RouteDetails {
  id: string
  number: string
  name?: string
  order: number
  buses: BusAssignment[]
}

export interface DayPlan {
  date: string // формат YYYY-MM-DD
  routes: Route[]
  reserveDrivers: {
    id: string
    personnelNumber: string
    firstName: string
    lastName: string
    middleName?: string
  }[]
}

// Типы для итоговой разнарядки
export interface DriverInfo {
  id: string
  personnelNumber: string
  fullName: string
  status: string
}

export interface RouteAssignment {
  routeNumber: string
  garageNumber: string
  stateNumber: string
  driver: DriverInfo
  departureTime: string // формат HH:MM
  scheduleTime: string // формат HH:MM
  additionalInfo: string
  shift2Driver?: DriverInfo
  shift2AdditionalInfo?: string
  endTime: string // формат HH:MM
  notes?: string // Для дополнительных пометок
  departureNumber: number // номер выхода
}

export interface RouteGroup {
  routeId: string
  routeNumber: string
  assignments: RouteAssignment[]
}

export interface FinalDispatch {
  date: string // формат YYYY-MM-DD
  routeGroups: RouteGroup[]
  reserveAssignments: ReserveAssignment[]
}

// Типы для доступных автобусов и водителей
export interface AvailableBus extends Bus {
  isAssigned: boolean
  assignedRouteId?: string
  assignedRouteName?: string
  assignedDepartureNumber?: number
}

export interface AvailableDriver extends Driver {
  isAssigned: boolean
  assignedRouteId?: string
  assignedRouteName?: string
  assignedDepartureNumber?: number
}

// Типы для праздничных дней
export interface Holiday {
  date: string // формат YYYY-MM-DD
  name: string
}

