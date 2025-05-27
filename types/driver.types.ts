// Типы данных для автопарка

export interface Bus {
  id: string
  govNumber: string
  garageNumber: string
  additionalInfo: string
  busLineId: string
  busStatus: string
  convoyId: string
}


export type DriverStatus =
  | "OnWork"
  | "DayOff"
  | "OnVacation"
  | "OnSickLeave"
  | "Intern"
  | "Fired"

// Количество водителей по каждому статусу:
export type DriverStatusCount = {
  [K in DriverStatus]: number
} & {
  total: number
}


export interface Driver {
  id?: string
  fullName: string
  serviceNumber: string
  address: string
  phone: string
  birthDate: string
  additionalInfo: string
  driverStatus: DriverStatus
  busId?: string | null
  lastBusId?: string | null
  convoyId?: string
  inReserve?: boolean
  buses?: Bus[] // 🔥 добавь это
  iin?: string | null
}

export interface DisplayDriver {
  id: string
  fullName: string
  serviceNumber: string
  driverStatus: DriverStatus
  isAssigned?: boolean
  assignedRoute?: string
  assignedDeparture?: number
  isBusy?: boolean // ← обязательно
}


export interface DisplayBus {
  id: string
  govNumber: string
  garageNumber: string
  busStatus: string
  isAssigned?: boolean
  assignedRoute?: string
  assignedDeparture?: number
  isBusy?: boolean // ← обязательно
}

// Для создания водителя (POST /drivers)
export interface CreateDriverRequest extends Omit<Driver, "id" | "photo" | "inReserve"> {}

// Для обновления водителя (PUT /drivers/{id})
export interface UpdateDriverRequest extends Omit<Driver, "id" | "photo" | "inReserve"> {}

// Ответ API
export interface ApiResponse<T> {
  isSuccess: boolean
  error: string | null
  statusCode: number
  value: T | null
}

export type PickedDriver = Pick<Driver, "id" | "serviceNumber" | "fullName">

// Для фильтрации водителей (POST /drivers/filter)
export interface DriverFilterRequest {
  convoyId: string | null
  fullName: string | null
  serviceNumber: string | null
  address: string | null
  phone: string | null
  driverStatus: DriverStatus | null
  // isInReserve: boolean | null
  page: number 
  pageSize: number
}

// Ответ при фильтрации водителей с пагинацией
export interface PaginatedDriversResponse {
  items: Driver[]
  totalCount: number
  statusCounts: DriverStatusCount
}

// Статистика по статусам водителей

// Общая информация о флоте
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

export type WeekendDriver = DisplayDriver;
export type WeekendBus = DisplayBus;
// Новая сущность BusLine
export interface BusLine {
  id?: string
  number: string
  exitTime: string // ISO формат
  endTime: string // ISO формат
  shiftChangeTime: string // ISO формат
  routeId: string
}
