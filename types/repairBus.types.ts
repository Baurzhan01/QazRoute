// types/repairBus.types.ts

export interface ApiResponse<T> {
  isSuccess: boolean;
  error: string | null;
  statusCode: number;
  value: T;
}

// --- Запрос на создание/обновление ---
export interface CreateRepairRequest {
  id?: string;               // при обновлении
  busId: string;
  applicationNumber: number;

  departureDate: string;     // "YYYY-MM-DD"
  entryDate: string;         // "YYYY-MM-DD"
  registerNumber: string;

  // Запчасти
  sparePartId?: string | null;
  sparePartCount?: number;
  sparePartPrice?: number;   // 👈 добавить

  // Работы
  laborTimeId?: string | null;
  workCount?: number;
  workHour?: number;
  workPrice?: number;        // 👈 добавить
}

export interface RepairRegister {
  registerNumber: string;
  applicationsCount: number;
  totalWorkSum: number;
  totalSpareSum: number;
  totalAllSum: number;
  firstInputDate: string;
  lastInputDate: string;
}
export interface RepairRegisterApplication {
  applicationNumber: number;
  busId: string;
  garageNumber: string;
  govNumber: string;
  workSum: number;
  workCount: number;
  workHourTotal: number;
  workPriceAvg: number;
  spareSum: number;
  sparePartCount: number;
  sparePartPriceAvg: number;
  allSum: number;
  firstDepartureDate: string;
  lastEntryDate: string;
  createdAtMin: string;
  createdAtMax: string;
  registerNumber: string;
}

export interface RepairRegisterDetail {
  registerNumber: string;
  applicationNumbers: number[];
  applications: RepairRegisterApplication[];
  totalWorkSum: number;
  totalSpareSum: number;
  totalAllSum: number;
  totalCount: number;
  page: number;
  pageSize: number;
}


export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
  totalAllSum?: number;
  totalWorkSum?: number;
  totalSpareSum?: number;
}

// --- Модель ремонта ---
export interface Repair {
  id: string;
  busId: string;
  applicationNumber: number;
  registerNumber: string;

  // Запчасти
  sparePartId: string | null;
  sparePart: string;
  sparePartCount: number;
  sparePartPrice: number;
  sparePartSum: number;
  sparePartArticle: string | null;

  // Работы
  laborTimeId: string | null;
  workName: string;
  workCount: number;
  workHour: number;
  workPrice: number;
  workSum: number;
  workCode: string;

  // Общая сумма
  allSum: number;

  // Даты
  departureDate: string;
  entryDate: string;
  createdAt: string;

  // Автобус
  garageNumber: string;
  govNumber: string;
}

// --- Пагинированный ответ ---
export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
  totalAllSum?: number;
  totalWorkSum?: number;
  totalSpareSum?: number;
}
