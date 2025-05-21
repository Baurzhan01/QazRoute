// Типы статусов диспетчера
import type { Convoy as BaseConvoy } from "@/types/convoy.types"
export type DispatcherStatus = "online" | "offline" | "blocked"

export type WorkShiftType = "Day" | "Night" | "DayOff" | "Vacation" | "Skip"

export interface DispatcherShift {
  date: string // ISO-строка
  shiftType: WorkShiftType
}

// Тип автоколонны
export interface Convoy extends BaseConvoy{
  id: string
  name: string
  number: number
}

// Тип диспетчера
export interface Dispatcher {
  id: string
  fullName: string
  login: string
  email: string
  password: string
  lastActivity: string | null
  status: DispatcherStatus
  convoy: Convoy
  shiftsCount: number
}

// Тип для создания нового диспетчера
export interface NewDispatcher {
    fullName: string
    login: string
    email: string
    password: string
    convoy: {
      id: string
      name: string
      number: string
    }
  }
  

// Тип для фильтрации диспетчеров
export interface DispatcherFilters {
  status: DispatcherStatus | null
  convoyId: string | null
}

// Тип статуса смены
export type ShiftStatus = "scheduled" | "in-progress" | "completed"

// Тип смены диспетчера
export interface DispatcherShift {
  id: string
  dispatcherId: string
  date: string
  startTime: string
  endTime: string
  duration: number
  status: ShiftStatus
}
