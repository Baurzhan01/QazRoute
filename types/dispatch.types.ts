// types/dispatch.types.ts

import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import type { Schedule } from "@/types/schedule.types"

// 🔵 Основной тип выездов
export interface Departure {
  id: string
  departureNumber: number
  departureTime: string
  scheduleTime: string
  shift2Time?: string
  endTime: string
  additionalInfo: string
  shift2AdditionalInfo: string
  bus?: DisplayBus
  driver?: DisplayDriver
  shift2Driver?: DisplayDriver

  // 👇 Добавить эту строку
  isModified?: boolean
}

// 🛠️ Props для модалки редактирования основного выхода
export interface EditAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  departure: Departure | null
  availableBuses: DisplayBus[]
  availableDrivers: DisplayDriver[]
  onSave: (updated: Departure) => void
}

// 🛠️ Props для модалки добавления второй смены
export interface SecondShiftModalProps {
  isOpen: boolean
  onClose: () => void
  departure: Departure | null
  availableDrivers: DisplayDriver[]
  onSave: (driverId: string, shiftChangeTime: string) => void
  schedules: Schedule[]
}

// 🛠️ Props для модалки редактирования времени
export interface TimeEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (time: string) => void
  currentTime: string
  title: string
}

// 🚌 Детали маршрута для страницы / маршрут + автобусы
export interface RouteDetails {
  routeId: string
  routeNumber: string
  buses: {
    busId: string
    garageNumber: string
    govNumber?: string
    driver?: {
      personnelNumber: string
      lastName: string
      firstName: string
      middleName?: string
      shifts: {
        departureTime: string
        scheduleTime: string
        additionalInfo?: string
      }[]
    }
    endTime?: string
    isReserve?: boolean
  }[]
}

// 📄 Структура ответа для API /api/dispatches/route/{routeId}/date/{date}
export interface RouteDispatchDetails {
  id: string
  date: {
    year: number
    month: number
    day: number
    dayOfWeek: number
    dayOfYear: number
    dayNumber: number
  }
  routeId: string
  routeNumber: string
  busLines: BusLineAssignment[]
}

// 📄 Один назначенный выход (автобус + водители + график)
export interface BusLineAssignment {
  id: string
  busLine: {
    id: string
    number: string
    exitTime: TimeObject
    endTime: TimeObject
  }
  bus: {
    id: string
    garageNumber: string
    govNumber: string
  } | null
  driver1: {
    id: string
    fullName: string
    serviceNumber: string
  } | null
  driver2: {
    id: string
    fullName: string
    serviceNumber: string
  } | null
  scheduleStart: TimeObject
  scheduleShiftChange: TimeObject
}

// 📅 Формат времени от сервера
export interface TimeObject {
  hour: number
  minute: number
  second: number
  millisecond: number
  microsecond: number
  nanosecond: number
  ticks: number
}
