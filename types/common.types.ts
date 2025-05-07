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
  