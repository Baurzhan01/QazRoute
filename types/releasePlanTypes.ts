// types/releasePlan/releasePlan.types.ts

import type { DisplayDriver } from "@/types/driver.types"
import type { DisplayBus } from "@/types/bus.types"

export type ValidDayType = "workday" | "saturday" | "sunday" | "holiday"

// 📅 Дата без времени
export interface DateDto {
  year: number
  month: number
  day: number
}

// Создание разнарядки
export interface DispatchRouteCreateRequest {
  convoyId: string
  date: string
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
  driverId?: string
  busId?: string
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

// 🏁 Итоговая разнарядка
export interface FinalDispatchData {
  date: string
  routeGroups: RouteGroup[]
  reserveAssignments: ReserveAssignment[]

  // 👇 добавь эти поля:
  repairBuses: string[]         // список автобусов на ремонте
  dayOffBuses: string[]         // автобусы на выходном
  driverStatuses: {
    DayOff?: string[]
    OnVacation?: string[]
    OnSickLeave?: string[]
    Intern?: string[]
    total?: number
  }
}


export interface RouteGroup {
  routeId: string
  routeNumber: string
  assignments: RouteAssignment[]
}

export interface RouteAssignment {
  dispatchBusLineId: string;
  garageNumber: string
  stateNumber: string
  driver: {
    serviceNumber: string
    fullName: string
  } | null
  departureTime: string
  scheduleTime: string
  additionalInfo?: string
  shift2AdditionalInfo?: string
  shift2Driver?: {
    serviceNumber: string
    fullName: string
  }
  endTime: string
}

export interface ReserveAssignment {
  dispatchBusLineId: string;
  sequenceNumber: number
  garageNumber: string
  stateNumber: string
  driver: {
    serviceNumber: string
    fullName: string
  }
  departureTime: string
  scheduleTime: string
  additionalInfo?: string
  shift2Driver?: {
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
  scheduleShiftChange?: TimeObject
}
