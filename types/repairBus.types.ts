// src/types/repairBus.types.ts

/** Обёртка стандартного ответа бэка */
export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T;
  }

  
  export interface RepairWork {
    name: string;
    count: number;
    hour: number;
    price: number;
    sum: number;
  }
  
  export interface RepairSparePart {
    name: string;
    count: number;
    price: number;
    sum: number;
  }
  
  export interface CreateRepairRequest {
    busId: string;
    applicationNumber: number;
    
    
    sparePart: string;
    sparePartCount: number;
    sparePartPrice: number;
    
    
    /** YYYY-MM-DD */
    departureDate: string;
    /** YYYY-MM-DD */
    entryDate: string;
    
    
    workName: string;
    workCount: number;
    workHour: number;
    workPrice: number;
    }
    
    
    // для отправки batch'ом — просто массив CreateRepairRequest[]
    export type CreateRepairBatchRequest = CreateRepairRequest[];
  
  export interface Repair {
    id: string;
    busId: string;
    createdAt: string;
    applicationNumber: number;
    departureDate: string;
    entryDate: string;
    works: RepairWork[];
    spareParts: RepairSparePart[];
    allSum: number;
    garageNumber: string;
    govNumber: string;
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
  