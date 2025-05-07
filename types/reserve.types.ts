import type { DisplayBus } from "./bus.types"
import type { DisplayDriver } from "./driver.types"

// === UI тип Резервного выхода для таблицы (ReserveTable) ===
export interface ReserveDepartureUI {
  id: string
  sequenceNumber: number
  bus?: DisplayBus
  driver?: DisplayDriver
  departureTime?: string
  scheduleTime?: string
  additionalInfo?: string
  shift2Driver?: DisplayDriver
  shift2AdditionalInfo?: string
  endTime?: string
}
