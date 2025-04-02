// types/schedule.types.ts
export interface Schedule {
    id?: string;
    busLineId: string;
    namePoint: string;
  }
  
  export interface CreateScheduleRequest {
    busLineId: string;
    namePoint: string;
  }
  
  export interface UpdateScheduleRequest {
    busLineId: string;
    namePoint: string;
  }
  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }