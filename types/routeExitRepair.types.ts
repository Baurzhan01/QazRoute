
export interface CreateRouteExitRepairDto {
  startDate: string
  startTime: string
  andDate: string | null
  andTime: string | null
  dispatchBusLineId?: string | null // ← теперь опционально
  reserveId?: string | null         // ← новое поле
  repairId?: string | null
  isExist: boolean
  text: string
  mileage: number
  isLongRepair: boolean
  repairType: RouteExitRepairStatus
  isLaunchedFromGarage: boolean; // ← новое поле
}

export interface BusRepairStatsResponse {
  totalRepairs: number
  unscheduledCount: number
  longTermCount: number
  otherCount: number
  totalDowntimeHours: number
  averageRepairDurationHours: number
  history: RouteExitRepairDto[]
}

export interface RouteExitRepairConvoyStat {
  convoyId?: string
  planned?: number
  unplanned?: number
  long?: number
  other?: number
}

export interface RouteExitRepairStatsByDate {
  total?: number
  totalPlanned?: number
  totalUnplanned?: number
  totalLong?: number
  totalOther?: number
  byConvoy?: RouteExitRepairConvoyStat[] | Record<string, RouteExitRepairConvoyStat>
}

  
export type RouteExitRepairStatus = "Unscheduled" | "Other" | "LongTerm" | "LaunchedFromGarage"

export interface RouteExitRepairDto {
  id: string
  andTime: string | null // ← добавить эту строку
  startDate: string
  startTime: string
  startRepairTime : string | null
  endRepairDate: string | null
  endRepairTime: string | null
  text: string
  mileage: number | null
  isExist: boolean
  isReady: boolean
  dispatchBusLineId: string | null
  repairId?: string | null
  reserveId: string | null
  repairType: RouteExitRepairStatus
  isLaunchedFromGarage: boolean;

  // новые поля:
  bus?: {
    id: string
    govNumber: string
    garageNumber: string
    brand?: string
    vinCode?: string
    dataSheetNumber?: string
  }
  driver?: {
    id: string
    fullName: string
    serviceNumber: string
  }
  route?: {
    id: string
    number: string
  }
  convoy?: {
    id: string
    number: number
  }
  busLine?: {
    id: string
    number: string
    exitTime: string
    endTime: string
    shiftChangeTime?: string | null
  }
}

  
  
  