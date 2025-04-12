// Типы данных для страницы маршрута
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
  
  export interface Departure {
    id: string
    departureNumber: number
    departureTime: string
    scheduleTime: string
    additionalInfo: string
    shift2AdditionalInfo: string
    endTime: string
    bus?: Bus
    driver?: Driver
    shift2Driver?: Driver
    shift2Time?: string // Время пересменки
  }
  
  // Типы для графиков работы
  export interface Schedule {
    id: string
    routeId: string
    routeNumber: string
    type: "full" | "split" // полный или разделенный график
    departureNumbers: number[] // номера выходов, к которым применяется график
    shiftChangeTime?: string // время пересменки для разделенного графика
  }
  
  // Типы для модальных окон
  export interface TimeEditModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (time: string) => void
    currentTime: string
    title: string
  }
  
  export interface EditAssignmentModalProps {
    isOpen: boolean
    onClose: () => void
    departure: Departure | null
    availableBuses: Bus[]
    availableDrivers: Driver[]
    onSave: (updatedDeparture: Departure) => void
  }
  
  export interface SecondShiftModalProps {
    isOpen: boolean
    onClose: () => void
    departure: Departure | null
    availableDrivers: Driver[]
    onSave: (driverId: string, shiftChangeTime: string) => void
    schedules: Schedule[] // Графики для определения времени пересменки
  }
  
  