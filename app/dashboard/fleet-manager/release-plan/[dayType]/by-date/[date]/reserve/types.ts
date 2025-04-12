// Типы данных для страницы резерва
export interface Driver {
  id: string
  personnelNumber: string
  fullName: string
  status: string // Статус водителя
  isAssigned?: boolean
  assignedRoute?: string
  assignedDeparture?: number
}

export interface Bus {
  id: string
  garageNumber: string
  stateNumber: string
  status: string // Статус автобуса
  drivers: Driver[]
}

export interface ReserveDeparture {
  id: string
  sequenceNumber: number // Порядковый номер в резерве
  departureTime: string
  scheduleTime: string
  additionalInfo: string
  shift2AdditionalInfo: string
  endTime: string
  bus?: Bus
  driver?: Driver
  shift2Driver?: Driver
}
