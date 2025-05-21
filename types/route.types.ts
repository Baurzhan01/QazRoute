import type { BusLine } from "@/types/busLine.types"

export type RouteStatus = "Workday" | "Saturday" | "Sunday"
export type DayType = "workdays" | "saturday" | "sunday"

// Станция отправления маршрута
export interface Station {
  id: string
  name: string
  convoyId: string
  convoyNumber: number
}

// Данные формы создания/редактирования маршрута
export interface RouteFormData {
  name: string
  exitNumbers: string
  orderInSchedule: string
  additionalInfo: string
  stationId: string
  dayType: DayType
}

// Основной маршрут
export interface Route {
  id: string
  convoyId: string
  routeStatus: RouteStatus
  number: string
  queue: number
  busLines: BusLine[]
}

// Создание маршрута (POST)
export interface CreateRouteRequest {
  convoyId: string
  routeStatus: RouteStatus
  number: string
  queue: number
}

// Обновление маршрута (PUT)
export interface UpdateRouteRequest {
  convoyId: string
  routeStatus: RouteStatus
  number: string
  queue: number
  busLineNumbers: string[]
}

// Ответ API
export interface ApiResponse<T> {
  isSuccess: boolean
  error: string | null
  statusCode: number
  value: T | null
}

// Используется при отображении назначений
export interface RouteAssignment {
  routeNumber: string
  garageNumber: string
  stateNumber: string
  departureTime: string
  scheduleTime: string
  endTime: string
  additionalInfo: string
}

// Результат проверки дубликатов маршрута
export interface RouteConflict {
  convoyId: string
  convoyNumber: number
  busLineNumbers: string[]
}
