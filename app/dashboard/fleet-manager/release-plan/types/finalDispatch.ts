// Типы данных для итоговой разнарядки
export interface DriverInfo {
    id: string
    personnelNumber: string
    fullName: string
    status: string
  }
  
  export interface BusInfo {
    id: string
    garageNumber: string
    stateNumber: string
    status: string
  }
  
  export interface ShiftInfo {
    departureTime: string
    scheduleTime: string
    additionalInfo: string
  }
  
  export interface RouteAssignment {
    routeNumber: string
    garageNumber: string
    stateNumber: string
    driver: DriverInfo
    departureTime: string
    scheduleTime: string
    additionalInfo: string
    shift2Driver?: DriverInfo
    shift2AdditionalInfo?: string
    endTime: string
    notes?: string // Для дополнительных пометок
  }
  
  export interface RouteGroup {
    routeId: string
    routeNumber: string
    assignments: RouteAssignment[]
  }
  
  export interface ReserveAssignment {
    sequenceNumber: number
    garageNumber: string
    stateNumber: string
    driver: DriverInfo
    departureTime: string
    scheduleTime: string
    additionalInfo: string
    shift2Driver?: DriverInfo
    shift2AdditionalInfo?: string
    endTime: string
    notes?: string
  }
  
  export interface FinalDispatchData {
    date: Date
    routeGroups: RouteGroup[]
    reserveAssignments: ReserveAssignment[]
  }
  