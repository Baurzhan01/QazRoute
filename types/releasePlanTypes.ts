// types/releasePlan/releasePlan.types.ts

import type { DisplayDriver } from "@/types/driver.types"
import type { ActionLogStatus } from "@/types/actionLog.types"
import type { DisplayBus } from "@/types/bus.types"
import type { RepairRecord } from "../app/dashboard/repairs/planned/hooks/usePlannedRepairs"
import type { StatementStatus } from "@/types/statement.types" // ← добавили

// ✅ Тип дня
export type ValidDayType = "workday" | "saturday" | "sunday" | "holiday"

// 📅 Дата без времени
export interface DateDto {
  year: number
  month: number
  day: number
}

// 🚍 Заказ (Order)
export interface OrderAssignment {
  id: string
  sequenceNumber: number
  departureTime: string
  scheduleTime: string
  endTime: string
  garageNumber: string
  govNumber: string
  busId: string | null
  driver?: {
    id: string
    fullName: string
    serviceNumber: string
  }
  additionalInfo: string
}

// 🔄 История замен
export interface DispatchReplacementHistoryDto {
  type: "REPAIR" | "REPLACEMENT"
  status?: string
  oldDriverName?: string
  newDriverName?: string
  oldBusNumber?: string
  newBusNumber?: string
  isFirstShift?: boolean
  replacedAt: string

  // REPAIR-specific:
  startDate?: string
  startTime?: string
  andTime?: string
  startRepairTime?: string
  endRepairDate?: string
  endRepairTime?: string
  repairText?: string
  repairType?: string
}

// 📋 Общая дьюти разнарядка (Duty)
export interface DispatchDutyRecord {
  routeNumber: string
  busLineNumber: string
  govNumber?: string
  garageNumber?: string
  vinCode?: string
  busBrand?: string
  driverFullName?: string
  driverServiceNumber?: string
}

export interface DutyApiResponse {
  routeNumber: string
  exits: {
    exitNumber: string
    garageNumber: string
    govNumber: string
    vinCode?: string
    brand: string
    driverFullName: string
    driverServiceNumber?: string
  }[]
}

// 🧩 Назначение/замена выхода
export interface AssignmentReplacement {
  exitNumber: string
  routeNumber: string
  serviceNumber: string
  dispatchBusLineId: string
  bus: {
    id?: string
    govNumber: string
    garageNumber: string
    convoyId?: string
    convoyNumber?: number
    brand?: string
  } | null
  firstDriver: {
    id?: string
    fullName: string
    convoyId?: string
    convoyNumber?: number
  } | null
  secondDriver: {
    id?: string
    fullName: string
    convoyId?: string
    convoyNumber?: number
  } | null
  departureTime: string
  endTime: string
  releasedTime: string | null
  normSolarium: number
  description: string | null
  status: string
  isReleased: boolean
  historyReplace: any
}

// 🧾 Создание разнарядки
export interface DispatchRouteCreateRequest {
  convoyId: string
  date: string
}

// 🚌 DTO выхода маршрута
export interface BusLineDto {
  id: string
  busId: string | null
  driver1Id: string | null
  driver2Id: string | null
  departureTime: string
  endTime: string
  scheduleStart?: string | null
  scheduleShiftChange?: string | null
}

// 🧭 Обновление разнарядки
export interface DispatchRouteUpdateRequest {
  dispatchRouteId: string
  busLines: BusLineDto[]
}

// 🧩 DTO для назначения водителей и автобусов
export interface DispatchBusLineDto {
  dispatchBusLineId: string
  driver1Id: string | null
  driver2Id: string | null
  busId: string | null
}

export interface BusLineAssignmentRequest {
  dispatchBusLineId: string
  driver1Id: string | null
  driver2Id: string | null
  busId: string | null
}

// 🧍 Резерв
export interface ReserveAssignmentDto {
  driverId?: string | null
  busId?: string | null
  description?: string | null
}

export interface ReserveAssignmentUI {
  id: string
  sequenceNumber: number
  departureTime: string
  scheduleTime: string
  endTime: string
  garageNumber: string
  govNumber: string
  busId: string | null
  driver?: {
    id: string
    fullName: string
    serviceNumber: string
  }
  additionalInfo: string
  status: "Reserved" | "Order"
  isReplace: boolean
}

// 🚌 Выход маршрута
export interface Departure {
  id: string
  departureNumber: number
  departureTime: string
  scheduleTime: string
  additionalInfo: string
  endTime: string
  shift2Time?: string
  shift2AdditionalInfo?: string
  startShiftChangeTime?: string | null
  isModified?: boolean
  bus?: DisplayBus
  driver?: DisplayDriver
  shift2Driver?: DisplayDriver
  shiftChangeTime?: string | null
  busLine?: {
    id: string
    number: string
    exitTime?: string | null
    endTime?: string | null
    shiftChangeTime?: string | null
  }
}

export type LocalDeparture = Departure & {
  shift2AdditionalInfo: string
  shift2Time: string
  isModified?: boolean
}

// 📋 Маршрут в плане выпуска
export interface DispatchRoute {
  routeId: string
  routeNumber: string
  startStation: string
  endStation: string
  busLineNumber: number
  assignedDrivers: {
    driverId: string
    driverName: string
  }[]
}

// 🧍 Водитель в резерве
export interface ReserveDriver {
  id: string
  personnelNumber: string
  firstName: string
  lastName: string
  middleName?: string
}

// 📅 План выпуска
export interface DayPlan {
  date: string
  routes: DispatchRoute[]
  reserves: ReserveDriver[]
}

// 🧩 Назначение резерва
export interface AssignReserveItem {
  id: string
  driverId: string
  driverFullName: string
  driverTabNumber: string
  garageNumber: string
  govNumber: string
  isReplace: boolean
  description: string | null
}

export interface AssignUnplannedDispatchResponse {
  date: string
  reserves: AssignReserveItem[]
  routes: {
    routeId: string
    routeNumber: string
  }[]
  busLines: {
    busLineId: string
    dispatchBusLineId: string
    busLineNumber: string
    routeId: string
    routeNumber: string
    endTime: string
    exitTime: string
    firstDriver?: {
      id: string
      fullName: string
      serviceNumber: string
    } | null
    bus?: {
      id: string
      garageNumber: string
      govNumber: string
    } | null
  }[]
}

// 🧰 Для ремонта
export interface FinalDispatchForRepair {
  date: string
  routes: {
    routeId: string
    routeNumber: string
    busLines: {
      dispatchBusLineId: string
      bus?: {
        id: string
        govNumber: string
        garageNumber: string
      }
      firstDriver?: {
        id: string
        fullName: string
      }
    }[]
  }[]
  reserves: any[]
}

// 🏁 Итоговая разнарядка
export interface FinalDispatchData {
  date: string
  routeGroups: RouteGroup[]
  reserveAssignments: ReserveAssignment[]
  repairBuses: string[]
  dayOffBuses: string[]
  driverStatuses: {
    DayOff?: string[]
    OnVacation?: string[]
    OnSickLeave?: string[]
    Intern?: string[]
    total?: number
  }
  buses?: DisplayBus[]
  drivers?: DisplayDriver[]
  reserve?: ReserveReplacementCandidate[]
  orders: OrderAssignment[]
  scheduledRepairs: RepairRecord[]
}

// 🧾 Итоговая ведомость (Statement)
export type StatementStatusText =
  | "Undefined"
  | "Released"
  | "Replaced"
  | "Permutation"
  | "Removed"
  | "RearrangingRoute"
  | "RearrangementRenovation"
  | "Oder"
  | "LaunchedFromGarage"
  | "OnWork"
  | "GotOff"
  | "OnOrder"
  | "Completed"
  | "Rejected"

export interface StatementBus {
  id: string
  garageNumber: string
  govNumber: string
  mileage: number | null
}

export interface StatementDriver {
  id: string
  fullName: string
  serviceNumber: string
}

export interface StatementBusShort {
  id: string
  garageNumber: string
  govNumber: string
  mileage?: number | null
}

export interface StatementDriverShort {
  id: string
  fullName: string
  serviceNumber: string
}

export interface StatementActionLogEntry {
  time: string | TimeObject
  description: string | null
  id?: string
  status?: ActionLogStatus | null
  replacementType: string | null
  driver?: StatementDriverShort | null
  bus?: StatementBusShort | null
  // Optional revolutions provided by backend for specific log entries
  revolution?: number | null
  factRevolution?: number | null
  spokenRevolutions?: number | null
}

export interface StatementBusLine {
  busLineId: string
  actionStatus?: string | null            // статусовка действия (строка с бэка)
  statementStatus?: StatementStatus | null // строгая типизация статуса ведомости
  dispatchBusLineId: string
  busLineNumber: string
  exitTime: string
  endTime: string
  scheduleStart: TimeObject | null
  scheduleShiftChange: TimeObject | null
  status: StatementStatusText | DispatchBusLineStatus
  description: string | null
  bus: StatementBus | null
  firstDriver: StatementDriver | null
  secondDriver: StatementDriver | null
  releasedTime: string | null
  normSolarium: number | null
  isRealsed: boolean
  statementId: string
  planRevolutions: number
  revolutions: number
  factRevolutions: number
  onOrder?: StatementActionLogEntry[]
  removed?: StatementActionLogEntry[]
}

export interface StatementRoute {
  routeId: string
  routeNumber: string
  busLines: StatementBusLine[]
}

export interface FullStatementData {
  id: string
  date: string
  routes: StatementRoute[]
  onOrder?: StatementActionLogEntry[]
  removed?: StatementActionLogEntry[]
}

export interface ReserveReplacementCandidate {
  id: string
  dispatchBusLineId: string
  busId: string
  driverId: string
  driverFullName: string
  driverTabNumber: string
  garageNumber: string
  govNumber: string
  description?: string
  isReplace: boolean
}

export enum DispatchBusLineStatus {
  Undefined = 0,
  Released = 1,
  Replaced = 2,
  Permutation = 3,
  Removed = 4,
  RearrangingRoute = 5,
  RearrangementRenovation = 6,
  Oder = 7,
  LaunchedFromGarage = 8,
}

export interface RouteGroup {
  routeId: string
  routeNumber: string
  assignments: RouteAssignment[]
}

export interface RouteAssignment {
  dispatchBusLineId: string
  busLineNumber: string
  routeNumber?: string
  description?: string
  additionalInfo?: string
  garageNumber: string
  stateNumber: string
  bus?: {
    id: string
    garageNumber: string
    govNumber: string
  }
  driver: {
    id: string
    serviceNumber: string
    fullName: string
  } | null
  departureTime: string
  scheduleTime: string
  endTime: string
  status?: DispatchBusLineStatus
  isRealsed: boolean
  fuelAmount?: string
  releasedTime?: string
  shift2Driver?: {
    id: string
    serviceNumber: string
    fullName: string
  }
  shift2AdditionalInfo?: string
  shiftChangeTime?: string
  startShift2Time?: string
}

export interface ReserveAssignment {
  id: string
  dispatchBusLineId: string
  sequenceNumber: number
  garageNumber: string
  govNumber: string
  driver: {
    id: string
    serviceNumber: string
    fullName: string
  }
  departureTime: string
  scheduleTime: string
  status?: DispatchBusLineStatus
  isReplace: boolean
  time?: string | null
  additionalInfo?: string
  shift2Driver?: {
    id: string
    serviceNumber: string
    fullName: string
  }
  endTime: string
}

export interface TimeObject {
  hour: number
  minute: number
}

export interface FullDispatchResponse {
  routeNumber: string
  busLines: FullDispatchBusLine[]
  repairBuses?: string[]
  dayOffBuses?: string[]
  driverStatuses?: {
    DayOff?: string[]
    OnVacation?: string[]
    OnSickLeave?: string[]
    Intern?: string[]
    total?: number
  }
}

export interface FullDispatchBusLine {
  id: string
  busLine: {
    id: string
    number: string
    exitTime: TimeObject | string
    endTime: TimeObject | string
  }
  bus?: {
    id: string
    garageNumber: string
    govNumber: string
  }
  driver1?: {
    id: string
    fullName: string
    serviceNumber: string
  }
  driver2?: {
    id: string
    fullName: string
    serviceNumber: string
  }
  scheduleStart?: TimeObject
  status?: DispatchBusLineStatus
  scheduleShiftChange?: TimeObject
}



