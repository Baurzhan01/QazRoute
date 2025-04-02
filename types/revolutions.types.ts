// types/revolutions.types.ts
export interface Revolution {
    id?: string;
    scheduleId: string;
    startTime: { ticks: number };
    endTime: { ticks: number };
  }
  
  export interface CreateRevolutionRequest {
    scheduleId: string;
    startTime: { ticks: number };
    endTime: { ticks: number };
  }
  
  export interface UpdateRevolutionRequest {
    scheduleId: string;
    startTime: { ticks: number };
    endTime: { ticks: number };
  }
  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }
  