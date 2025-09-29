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

// --- Модель ремонта ---
export interface Repair {
  id: string;
  busId: string;
  applicationNumber: number;

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
