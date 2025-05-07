import { Driver } from "./driver.types";

// types/bus.types.ts
export type BusStatus = "OnWork" | "UnderRepair" | "LongTermRepair" | "DayOff" | "Decommissioned"
  
export interface Bus {
    id: string;
    govNumber: string;
    garageNumber: string;
    additionalInfo: string;
    // busLineId: string;
    busStatus: BusStatus;
    convoyId: string;
  }

  export interface DisplayBus {
    id: string
    garageNumber: string
    govNumber: string
    stateNumber?: string
    status: BusStatus
    isAssigned: boolean
    assignedRoute?: string
    assignedDeparture?: number
}

  export interface BusWithDrivers extends Bus {
    drivers: Pick<Driver, "id" | "serviceNumber" | "fullName">[]
  }
  
  
  export interface BusStatsData {
    OnWork: number
    UnderRepair: number
    LongTermRepair: number
    DayOff: number
    Decommissioned: number
    total: number
  }
  
  
  export interface CreateBusRequest {
    govNumber: string;
    garageNumber: string;
    additionalInfo: string;
    busLineId: string;
    busStatus: BusStatus;
    convoyId: string;
  }

  export interface CreateBusRequestWithDrivers extends CreateBusRequest {
    driverIds: string[]
  }
  
  
  export interface UpdateBusRequest {
    govNumber: string;
    garageNumber: string;
    additionalInfo: string;
    busLineId: string;
    busStatus: BusStatus;
    convoyId: string;
  }
  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }
  export interface PaginatedBusesResponse {
    items: BusWithDrivers[]
    totalCount: number
  }
  