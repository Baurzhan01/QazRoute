// types/releasePlan/releasePlan.types.ts

import type { DisplayDriver } from "@/types/driver.types"
import type { DisplayBus } from "@/types/bus.types"
import type { RepairRecord } from "../app/dashboard/repairs/planned/hooks/usePlannedRepairs"


export type ValidDayType = "workday" | "saturday" | "sunday" | "holiday"

// 📅 Дата без времени
export interface DateDto {
  year: number
  month: number
  day: number
}

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

export interface AssignmentReplacement {
  exitNumber: string
  routeNumber: string
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


// Создание разнарядки
export interface DispatchRouteCreateRequest {
  convoyId: string
  date: string
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


// Обновление разнарядки
export interface DispatchRouteUpdateRequest {
  dispatchRouteId: string
  busLines: BusLineDto[]
}

// DTO выхода маршрута
export interface BusLineDto {
  id: string
  busId: string | null
  driver1Id: string | null
  driver2Id: string | null
  departureTime: string
  endTime: string
}

// DTO для назначения водителей и автобусов на выход
export interface DispatchBusLineDto {
  dispatchBusLineId: string
  driver1Id: string | null
  driver2Id: string | null
  busId: string | null
}

// DTO для редактирования назначений на выход
export interface BusLineAssignmentRequest {
  dispatchBusLineId: string
  driver1Id: string | null
  driver2Id: string | null
  busId: string | null
}

// Назначение в резерв
export interface ReserveAssignmentDto {
  driverId?: string | null
  busId?: string | null
  description?: string | null
}


// 🚌 Выход маршрута (Departure)
export interface Departure {
  id: string
  departureNumber: number
  departureTime: string
  scheduleTime: string
  additionalInfo: string
  endTime: string
  shift2Time?: string
  shift2AdditionalInfo?: string
  isModified?: boolean

  bus?: DisplayBus
  driver?: DisplayDriver
  shift2Driver?: DisplayDriver

  busLine?: {
    id: string
    number: string
    exitTime?: string | null
    endTime?: string | null
    shiftChangeTime?: string | null; // ← добавить вот это
  }
}

// ➕ Локальная копия Departure с метками изменений
export type LocalDeparture = Departure & {
  shift2AdditionalInfo: string
  shift2Time: string
  isModified?: boolean
}

// 📋 Структура маршрута внутри плана выпуска
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

// 🔵 Водитель в резерве
export interface ReserveDriver {
  id: string
  personnelNumber: string
  firstName: string
  lastName: string
  middleName?: string
}

// 📅 План выпуска на конкретный день
export interface DayPlan {
  date: string
  routes: DispatchRoute[]
  reserves: ReserveDriver[]
}

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

export interface FinalDispatchForRepair {
  date: string;
  routes: {
    routeId: string;
    routeNumber: string;
    busLines: {
      dispatchBusLineId: string;
      bus?: {
        id: string; // ← 🔧 добавь это
        govNumber: string;
        garageNumber: string;
      };
      firstDriver?: {
        id: string; // ← 🔧 добавь это
        fullName: string;
      };
    }[];
  }[];
  reserves: any[];
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
  // 🆕 Добавленные поля для замены (optional — чтобы не ломать другие места)
  buses?: DisplayBus[]
  drivers?: DisplayDriver[]
  reserve?: ReserveReplacementCandidate[]
  orders: OrderAssignment[] // ✅ правильно // или OrderAssignment[] если у тебя он отдельно
  scheduledRepairs: RepairRecord[]
}

export interface ReserveReplacementCandidate {
  id: string
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
  Released = 1,                     // Выпущено
  Replaced = 2,                     // Замена — из резерва
  Permutation = 3,                  // Перестановка — в выходной
  Removed = 4,                      // Снято

  RearrangingRoute = 5,            // Перестановка по маршруту
  RearrangementRenovation = 6,     // Перестановка с ремонта
  Oder = 7                         // С заказа (возможно Order?)
}

export interface RouteGroup {
  routeId: string
  routeNumber: string
  assignments: RouteAssignment[]
}

export interface RouteAssignment {
  dispatchBusLineId: string;
  busLineNumber: string;
  description?: string // 👈 Добавь эту строку
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
  status?: DispatchBusLineStatus
  isRealsed: boolean
  fuelAmount?: string 
  releasedTime?: string
  scheduleTime: string
  additionalInfo?: string
  shift2AdditionalInfo?: string
  shift2Driver?: {
    id: string
    serviceNumber: string
    fullName: string
  }
  endTime: string
}

export interface ReserveAssignment {
  id: string;
  dispatchBusLineId: string;
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
  isReplace:boolean
  time?: string | null  // ← вот это важно!
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
  // ✅ Добавить недостающие поля:
  repairBuses?: string[];
  dayOffBuses?: string[];
  driverStatuses?: {
    DayOff?: string[];
    OnVacation?: string[];
    OnSickLeave?: string[];
    Intern?: string[];
    total?: number;
  };
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
