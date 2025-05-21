// types/schedule.types.ts

export interface Schedule {
  id: string
  name: string
  startTime: string // в формате "HH:mm"
  endTime: string   // в формате "HH:mm"
  shiftType: "Morning" | "Evening" | "Night" | "Custom"
  description?: string
}

export interface CreateScheduleRequest {
  name: string
  startTime: string
  endTime: string
  shiftType: "Morning" | "Evening" | "Night" | "Custom"
  description?: string
}

export interface UpdateScheduleRequest extends CreateScheduleRequest {}

export interface ApiResponse<T> {
  isSuccess: boolean
  error: string | null
  statusCode: number
  value: T
}


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
  