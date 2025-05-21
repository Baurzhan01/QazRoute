import type { DateOnly, TimeOnly } from "./common.types"


export interface CreateOrderDto {
    busDepotId: string
    date: DateOnly
    departureTime: TimeOnly
    endTime: TimeOnly
    customerName?: string
    description?: string
    plannedBusCount?: number
  }
  
  export interface UpdateOrderDto {
    date: DateOnly
    departureTime: TimeOnly
    endTime: TimeOnly
    customerName?: string
    description?: string
    plannedBusCount?: number
  }
  
  export interface Order {
    id: string
    busDepotId: string
    date: DateOnly
    departureTime: TimeOnly
    endTime: TimeOnly
    customerName?: string
    description?: string
    plannedBusCount?: number
  }
  