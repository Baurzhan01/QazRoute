import type { DisplayDriver, Driver } from "./driver.types";

// Статус автобуса
export type BusStatus =
  | "OnWork"
  | "UnderRepair"
  | "LongTermRepair"
  | "DayOff"
  | "Decommissioned";

// Основная модель автобуса
export interface Bus {
  id: string;
  govNumber: string;
  garageNumber: string;
  additionalInfo: string;
  busStatus: BusStatus;
  convoyId: string;

  // 🔽 Новые поля:
  vinCode?: string;
  brand?: string;
  type?: string;
  year?: number;
  dataSheetNumber?: string;
  mileage?: number; // ← Добавлено
}

// Для отображения автобусов в UI
export interface DisplayBus {
  id: string
  govNumber: string
  garageNumber: string
  status?: string   // ← добавь это
  isAssigned?: boolean
  isBusy?: boolean     
  assignedRoute?: string
  stateNumber?: string // ← см. ниже
}

// Автобус с назначенными водителями
export interface BusWithDrivers extends Bus {
  drivers: Pick<Driver, "id" | "serviceNumber" | "fullName">[];
}

// Статистика по статусам автобусов
export interface BusStatsData {
  OnWork: number;
  UnderRepair: number;
  LongTermRepair: number;
  DayOff: number;
  Decommissioned: number;
  total: number;
}

// Создание автобуса без ID
export interface CreateBusRequest {
  govNumber: string;
  garageNumber: string;
  additionalInfo: string;
  busLineId: string;
  busStatus: BusStatus;
  convoyId: string;
}

// Создание автобуса с водителями
export interface CreateBusRequestWithDrivers extends CreateBusRequest {
  driverIds: string[];
}

// Обновление автобуса
export interface UpdateBusRequest {
  govNumber: string;
  garageNumber: string;
  additionalInfo: string;
  busLineId: string;
  busStatus: BusStatus;
  convoyId: string;
}

export type WeekendDriver = DisplayDriver;
export type WeekendBus = DisplayBus;

// Автобус с назначениями для депо
export interface DepotBusWithAssignment {
  busId: string;
  govNumber: string;
  garageNumber: string;
  status: string;
  routeName: string | null;
  busLineNumber: string | null;
  shiftType: string | null;
  driverFullName: string | null;
  convoyNumber: string;
}

// Универсальный ответ API
export interface ApiResponse<T> {
  isSuccess: boolean;
  error: string | null;
  statusCode: number;
  value: T | null;
}

// Ответ при фильтрации автобусов с пагинацией
export interface PaginatedBusesResponse {
  items: BusWithDrivers[];
  totalCount: number;
}
