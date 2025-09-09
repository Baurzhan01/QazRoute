// src/types/repairBus.types.ts

/** Обёртка стандартного ответа бэка */
export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T;
  }
  
  /** DTO даты формата DateOnly с бэка (.NET) */
  export interface DateOnlyDto {
    year: number;
    month: number; // 1-12
    day: number;   // 1-31
    /** Необязательное поле: день недели (если бэк его использует) */
    dayOfWeek?: number; // 0-6 или 1-7
  }
  
  /** Создание ремонта */
  export interface CreateRepairRequest {
    busId: string;
    applicationNumber: number;
  
    sparePart: string;
    sparePartCount: number;
    sparePartPrice: number;
  
    /** Дата выезда/отправки автобуса в ремонт (DateOnly) */
    departureDate: DateOnlyDto;
    /** Дата возврата/въезда автобуса из ремонта (DateOnly) */
    entryDate: DateOnlyDto;
  
    workName: string;
    workCount: number;
    workHour: number;
    workPrice: number;
  }
  
  /** Обновление ремонта (по спецификации бэка даты и busId не меняются) */
  export interface UpdateRepairRequest {
    applicationNumber: number;
  
    sparePart: string;
    sparePartCount: number;
    sparePartPrice: number;
  
    workName: string;
    workCount: number;
    workHour: number;
    workPrice: number;
  }
  
  /** Полная сущность ремонта из ответов бэка */
  export interface Repair {
    id: string;
    busId: string;
    createdAt: string; // ISO
  
    applicationNumber: number;
  
    sparePart: string;
    sparePartCount: number;
    sparePartPrice: number;
    sparePartSum: number;
  
    workName: string;
    workCount: number;
    workHour: number;
    workPrice: number;
    workSum: number;
  
    allSum: number;
  
    garageNumber: string;
    govNumber: string;
  
    /** В ответах приходит строка "YYYY-MM-DD" или "0001-01-01" */
    departureDate: string;
    /** В ответах приходит строка "YYYY-MM-DD" или "0001-01-01" */
    entryDate: string;
  }
  
  /** Хелпер для удобного формирования DateOnlyDto из JS Date/строки */
  export function toDateOnlyDto(date: Date | string): DateOnlyDto {
    const d = typeof date === "string" ? new Date(date) : date;
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      // dayOfWeek можно опустить; если нужно — раскомментируй:
      // dayOfWeek: d.getDay(),
    };
  }
  