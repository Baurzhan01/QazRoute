
export interface CreateRouteExitRepairDto {
  startDate: string
  startTime: string
  andDate: string | null
  andTime: string | null
  dispatchBusLineId?: string | null // ← теперь опционально
  reserveId?: string | null         // ← новое поле
  isExist: boolean
  text: string
  mileage: number
  isLongRepair: boolean
}
  
  
  export interface RouteExitRepairDto {
    id: string
    startDate: string
    startTime: string
    andDate: string | null
    andTime: string | null
    dispatchBusLineId: string
    isExist: boolean
    text: string
    mileage: number
    isLongRepair: boolean
  
    route: {
      id: string
      number: string
    }
  
    bus: {
      id: string
      garageNumber: string
      govNumber: string
    }
  
    driver: {
      id: string
      fullName: string
      serviceNumber: string
    }
  
    convoy: {
      id: string
      number: number
      chief: any // можно заменить на тип или null
      mechanic: any // можно заменить на тип или null
    }
  }
  
  
  