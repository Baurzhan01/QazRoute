export interface AddOrderBusDto {
    orderId: string
    busId: string
    driverId?: string | null
  }
  
  export interface OrderBus {
    id: string
    orderId: string
    busId: string
    driverId?: string | null
    bus?: {
      id: string
      garageNumber?: string
      govNumber?: string
    }
    driver?: {
      id: string
      fullName?: string
      serviceNumber?: string
    }
  }
  