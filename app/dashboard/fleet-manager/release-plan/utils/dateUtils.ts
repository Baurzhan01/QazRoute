// utils/dateUtils.ts

export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)); // ✅ строго UTC без смещения
}

export function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(date: Date): string {
  const day = date.getUTCDate();
  const month = date.toLocaleString("ru-RU", { month: "long", timeZone: "UTC" });
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export function formatDayOfWeek(date: Date): string {
  const daysOfWeek = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
  return daysOfWeek[date.getUTCDay()];
}

export function getDayType(
  date: Date,
  holidayDates: Date[]
): "workday" | "saturday" | "sunday" | "holiday" {
  if (isHoliday(date, holidayDates)) return "holiday";
  const day = date.getUTCDay();
  if (day === 0) return "sunday";
  if (day === 6) return "saturday";
  return "workday";
}

export function isHoliday(date: Date, holidays: Date[]): boolean {
  return holidays.some(
    (h) =>
      h.getUTCDate() === date.getUTCDate() &&
      h.getUTCMonth() === date.getUTCMonth() &&
      h.getUTCFullYear() === date.getUTCFullYear()
  );
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getUTCDate() === today.getUTCDate() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCFullYear() === today.getUTCFullYear()
  );
}

export function getMonthName(date: Date): string {
  return date.toLocaleString("ru-RU", { month: "long", timeZone: "UTC" });
}
