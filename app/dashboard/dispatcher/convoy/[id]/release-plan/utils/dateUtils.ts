// utils/dateUtils.ts

import { getHolidaysForYear } from "@/app/dashboard/fleet-manager/release-plan/data/holidays"
import type { ValidDayType } from "@/types/releasePlanTypes"
import { parseISO } from "date-fns"

export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day) // ✅ локальная дата
}

  
  export function formatDate(date: Date): string {
    const year = date.getFullYear(); // 🔁 было getUTCFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  
  export function formatDateLabel(date: Date): string {
    const day = date.getDate(); // 🔁 было getUTCDate()
    const month = date.toLocaleString("ru-RU", { month: "long" });
    const year = date.getFullYear(); // 🔁
    return `${day} ${month} ${year}`;
  }
  
  export function formatDayOfWeek(date: Date): string {
    const daysOfWeek = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
    return daysOfWeek[date.getDay()]; // 🔁 было getUTCDay()
  }
  
  export function getDayType(
    date: Date,
    holidayDates: Date[]
  ): "workday" | "saturday" | "sunday" | "holiday" {
    if (isHoliday(date, holidayDates)) return "holiday";
    const day = date.getDay(); // 🔁
    if (day === 0) return "sunday";
    if (day === 6) return "saturday";
    return "workday";
  }
  
  export function isHoliday(date: Date, holidays: Date[]): boolean {
    return holidays.some(
      (h) =>
        h.getDate() === date.getDate() &&
        h.getMonth() === date.getMonth() &&
        h.getFullYear() === date.getFullYear()
    );
  }
  
  export function isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
  
  export function getMonthName(date: Date): string {
    return date.toLocaleString("ru-RU", { month: "long" }); // 🔁 без timeZone
  }

  export function getDayTypeFromDate(dateStr: string): ValidDayType {
    const date = parseDate(dateStr) // ✅ вместо parseISO
    const holidayDates = getHolidaysForYear(date.getFullYear()).map((holiday) =>
      parseDate(holiday.date)
    )
    return getDayType(date, holidayDates)
  }
  
  
