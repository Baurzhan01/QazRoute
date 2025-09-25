// types/timesheet.types.ts

// Все возможные статусы дня в табеле
export type TimesheetDayStatus =
  | "Worked"       // Работал
  | "DayOff"       // Выходной
  | "OnVacation"   // Отпуск
  | "OnSickLeave"  // Больничный
  | "Intern"       // Стажировка
  | "Fired"        // Уволен
  | "Empty";       // Нет данных

// Водитель (сокращённая версия для табеля)
export interface TimesheetDriver {
  id: string;
  fullName: string;
  serviceNumber?: string | null;
}

// Данные одной ячейки (один день)
export interface DayCell {
  status: TimesheetDayStatus;
  routeAndExit?: string | null; // например: "302 / 1"
}

// Итоги по водителю за месяц
export interface Totals {
  worked: number;
  dayOff: number;
  vacation: number;
  sick: number;
  intern: number;
  fired: number;
}

// Одна строка табеля
export interface TimesheetRow {
  driver: TimesheetDriver;
  days: Record<number, DayCell | undefined>; // ключ = число месяца
  totals: Totals;
}
