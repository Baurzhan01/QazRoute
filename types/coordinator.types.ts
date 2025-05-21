export interface ConvoyCoordinatorCard {
  convoyId: string
  convoyName: string
  planned: number
  released: number
  completion: number
}

export type WorkShiftType = "Day" | "Night" | "DayOff" | "Vacation" | "Skip"

export interface WorkShiftDay {
  date: string // ISO Date string
  shiftType: WorkShiftType
}

export interface UserWorkShift {
  userId: string
  fullName: string
  role: string
  days: WorkShiftDay[]
  day: number
  night: number
  dayOff: number
  skip: number
  vacation: number
}
  
  export interface ConvoyCoordinatorSummary {
    assigned: number
    reserve: number
    planned: number
    available: number
  }
  
  export interface DispatchTable {
    convoyId: string
    convoyNumber: number
    routeNumber: string
    busLines: {
      id: string
      busNumber: string
      driver1: string
      driver2?: string
      status: string
    }[]
  }
  