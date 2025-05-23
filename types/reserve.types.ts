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
