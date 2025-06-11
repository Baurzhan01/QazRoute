export interface TimeDto {
    hour: number
    minute: number
  }
  
  export interface DateDto {
    year: number
    month: number
    day: number
    dayOfWeek: number
  }
  
  export interface RouteExitRepairDto {
    id: string
    startDate: DateDto
    startTime: TimeDto
    andDate: DateDto
    andTime: TimeDto
    dispatchBusLineId: string
    isExist: boolean
    text: string
    mileage: number
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
  }
  