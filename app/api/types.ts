// Типы данных для работы с API

export interface ApiResponse<T> {
  isSuccess: boolean
  error: string
  statusCode: number
  value: T
}

export interface Bus {
  id: string
  govNumber: string
  garageNumber: string
  additionalInfo: string
  busLineId: string
  busStatus: string
  convoyId: string
}

export interface BusDepot {
  id: string
  name: string
  city: string
}

export interface Convoy {
  id: string
  busDepotId: string
  chiefId: string
  mechanicId: string
  number: number
  busIds: string[]
}

export interface Driver {
  id?: string
  fullName: string
  serviceNumber: string
  address: string
  phone: string
  birthDate: {
    year: number
    month: number
    day: number
    dayOfWeek: number
  }
  additionalInfo: string
  driverStatus: string
  busId: string
}

export interface Route {
  id?: string
  number: string
}

export interface Schedule {
  id?: string
  busLineId: string
  namePoint: string
}

export interface Revolution {
  id?: string
  scheduleId: string
  startTime: {
    ticks: number
  }
  endTime: {
    ticks: number
  }
}

export interface AuthRequest {
  login: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  login: string
  password: string
  role: string
}

export interface FleetStats {
  totalBuses: number
  activeRoutes: number
  drivers: number
  maintenanceBuses: number
}

export interface FleetStatus {
  operational: number
  inMaintenance: number
  outOfService: number
}

export interface FuelConsumption {
  thisMonth: number
  lastMonth: number
  efficiency: number
}

export interface MaintenanceStatus {
  completed: number
  scheduled: number
  overdue: number
}

export interface Alert {
  id: string
  severity: "high" | "medium" | "low"
  title: string
  description: string
  timestamp: string
}

export interface ScheduleItem {
  id: string
  title: string
  description: string
  date: string
  icon: "clock" | "file" | "users"
}

