import type { DisplayBus } from "./bus.types"
import type { DisplayDriver } from "./driver.types"

// === UI тип Резервного выхода для таблицы (ReserveTable) ===
export interface ReserveDepartureUI {
  id: string
  sequenceNumber: number
  bus?: DisplayBus | null
  driver?: DisplayDriver | null
  departureTime?: string
  scheduleTime?: string
  additionalInfo?: string
  shift2Driver?: DisplayDriver | null
  shift2AdditionalInfo?: string
  endTime?: string
  justAdded?: boolean // ✅ Добавить это поле
}
export interface ReserveRawResponse {
  id: string
  busId: string | null
  driverId: string | null
  driverFullName: string | null
  driverTabNumber: string | null
  garageNumber: string
  govNumber: string
  description: string | null
  isReplace: boolean
}

export interface ReserveReplacementCandidate {
  id: string
  busId: string
  driverId: string
  driverFullName: string
  driverTabNumber: string
  garageNumber: string
  govNumber: string
  description?: string
  isReplace: boolean
}