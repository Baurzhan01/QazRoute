// Типы данных для маршрутов

export interface Route {
    id: string
    name: string
    exitNumbers: string
    orderInSchedule: string
    additionalInfo: string
    station: string
    scheduleType: ScheduleType
  }
  
  export type ScheduleType = "workdays" | "saturday" | "sunday"
  
  export interface RouteFormData {
    name: string
    exitNumbers: string
    orderInSchedule: string
    additionalInfo: string
    station: string
    scheduleType: ScheduleType
  }
  
  export interface Station {
    id: string
    name: string
    scheduleType: ScheduleType
  }
  
  