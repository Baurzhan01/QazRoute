// utils/timesheet.ts
export type TimesheetDayStatus =
  | "Worked"       // из разнарядки (getWorkHistory)
  | "DayOff"
  | "OnVacation"
  | "OnSickLeave"
  | "Intern"
  | "Fired"
  | "Empty";       // нет данных (по умолчанию)

  export const dayLabel: Record<TimesheetDayStatus, string> = {
    Worked: "Р",
    DayOff: "В",
    OnVacation: "ОТ",
    OnSickLeave: "Б",
    Intern: "СТ",
    Fired: "УВ",
    Empty: "",
  };

export function statusToColor(s: TimesheetDayStatus) {
  switch (s) {
    case "Worked": return "bg-green-100 border-green-300 text-green-800";
    case "DayOff": return "bg-red-100 border-red-300 text-red-700";
    case "OnVacation": return "bg-yellow-100 border-yellow-300 text-yellow-800";
    case "OnSickLeave": return "bg-blue-100 border-blue-300 text-blue-800";
    case "Intern": return "bg-purple-100 border-purple-300 text-purple-800";
    case "Fired": return "bg-gray-200 border-gray-300 text-gray-700";
    default: return "bg-white border-gray-200 text-gray-700";
  }
}

export function getMonthDays(year: number, month0: number) {
  // month0: 0..11
  const days = new Date(year, month0 + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
}

export function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
