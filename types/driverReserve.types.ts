import { DriverStatusCount } from "./driver.types";

// types/driverReserve.types.ts
export interface Driver {
    id?: string;
    fullName: string;
    serviceNumber: string;
    address: string;
    phone: string;
    birthDate: string 
    additionalInfo: string;
    driverStatus: string;
    busId?: string;
    lastBusId?: string // 
    convoyId?: string;
  }
  export interface PaginatedDriversResponse {
    items: Driver[]
    totalCount: number
    statusCounts: DriverStatusCount
  }
  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }