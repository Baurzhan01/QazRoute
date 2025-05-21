export interface DateDto {
    year: number
    month: number
    day: number
  }
  export interface TimeDto {
    hour: number
    minute: number
  }
  export type DayType = "workday" | "saturday" | "sunday" | "holiday"

  export interface DateOnly {
    year: number
    month: number
    day: number
  }
  
  export interface TimeOnly {
    hour: number
    minute: number
    second?: number
    millisecond?: number
  }
  

  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }