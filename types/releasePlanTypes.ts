// types/releasePlan/releasePlan.types.ts

import type { DisplayDriver, Driver } from "@/types/driver.types"
import type { DisplayBus } from "@/types/bus.types"

export type ValidDayType = "workday" | "saturday" | "sunday" | "holiday"

// 📅 Дата без времени
export interface DateDto {
  year: number
  month: number
  day: number
}

// ➡️ Запросы на создание/обновление разнарядки
export interface DispatchRouteCreateRequest {
  convoyId: string
  routeId: string
  date: string
}
// types/releasePlanTypes.ts

export type LocalDeparture = Departure & {
  shift2AdditionalInfo: string;
  shift2Time: string;
  isModified?: boolean;
};

export interface ReserveAssignmentDto {
  driverId?: string
  busId?: string
}

export interface DispatchRouteUpdateRequest {
  dispatchRouteId: string
  busLines: BusLineDto[]
}

export interface BusLineDto {
  id: string
  busId: string | null;
  driver1Id: string | null;
  driver2Id: string | null;
  departureTime: string;
  endTime: string;
}

// ➡️ Работа с резервом
export interface ReserveAssignmentDto {
  driverId?: string
  busId?: string
}

// ➡️ Назначение на выход автобуса
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

// 🚌 Основная единица выхода (Departure = 1 выход маршрута)
export interface Departure {
  id: string
  departureNumber: number
  departureTime: string
  scheduleTime: string
  additionalInfo: string
  endTime: string
  shift2Time?: string
  shift2AdditionalInfo?: string
  bus?: DisplayBus
  driver?: DisplayDriver
  shift2Driver?: DisplayDriver
}

// 📋 Структура маршрута для отображения на дне
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
  date: string;                    // Дата разнарядки
  routeGroups: RouteGroup[];       // Группы маршрутов (с назначениями)
  reserveAssignments: ReserveAssignment[]; // Назначения в резерве
}

export interface RouteGroup {
  routeId: string;                 // ID маршрута
  routeNumber: string;             // Номер маршрута
  assignments: RouteAssignment[];  // Назначения по выходам
}

export interface RouteAssignment {
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



