// types/repairBus.types.ts

// Универсальный ответ API
export interface ApiResponse<T> {
  isSuccess: boolean;
  error: string | null;
  statusCode: number;
  value: T;
}

// --- Создание ремонта ---
export interface CreateRepairRequest {
  busId: string;
  applicationNumber: number;

  departureDate: string; // строка "YYYY-MM-DD"
  entryDate: string;     // строка "YYYY-MM-DD"

  // Запчасти
  sparePartId?: string | null;
  sparePartCount?: number;

  // Работы
  laborTimeId?: string | null;
  workCount?: number;
  workHour?: number;
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
  departureDate: string; // "YYYY-MM-DD"
  entryDate: string;     // "YYYY-MM-DD"
  createdAt: string;     // ISO-строка

  // Данные автобуса
  garageNumber: string;
  govNumber: string;
}
