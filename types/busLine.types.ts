// types/busLine.types.ts
export interface BusLine {
    id?: string;
    number: string;
    exitTime: string; // Формат "HH:mm:ss"
    endTime: string;  // Формат "HH:mm:ss"
    shiftChangeTime: string | null; // Опционально, формат "HH:mm:ss" или null
  }
  
  export interface CreateBusLineRequest {
    number: string;
    exitTime: string; // Формат "HH:mm:ss"
    endTime: string;  // Формат "HH:mm:ss"
    shiftChangeTime: string | null; // Опционально, формат "HH:mm:ss" или null
  }
  
  export interface UpdateBusLineRequest {
    number: string;
    exitTime: string; // Формат "HH:mm:ss"
    endTime: string;  // Формат "HH:mm:ss"
    shiftChangeTime: string | null; // Опционально, формат "HH:mm:ss" или null
    routeId: string;
  }
  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }
