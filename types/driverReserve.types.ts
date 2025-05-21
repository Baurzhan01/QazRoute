import { DriverStatusCount } from "./driver.types";
// types/driverReserve.types.ts

import type { DriverStatus } from "./driver.types"
import type { Bus } from "./bus.types"

/**
 * Назначение в резерв
 * Используется при POST/DELETE на /dispatches/reserve/{date}/assignments
 */
export interface ReserveAssignment {
  driverId?: string
  busId?: string
}

/**
 * UI-тип для отображения данных резерва на фронте
 * Получается с GET /dispatches/reserve/{date}/all
 */
export interface ReserveDriverUI {
  id: string
  fullName: string
  serviceNumber: string
  driverStatus: DriverStatus
  assignedBus?: Bus | null
  note?: string // можно использовать для подсказки или служебного текста в UI
  shift?: 1 | 2 // если будешь поддерживать смену
  isNew?: boolean // для добавления вручную
}


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