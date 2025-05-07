export type StatusColor = "gray" | "green" | "yellow" | "red";

export interface StatusType {
  label: string;
  color?: StatusColor;
}

export type BusStatus = "OnWork" | "DayOff" | "UnderRepair" | "LongTermRepair" | "Decommissioned";

export function isAvailableBusStatus(status: BusStatus): boolean {
  return status === "OnWork" || status === "DayOff";
}

export type DriverStatus = "OnWork" | "DayOff" | "OnVacation" | "OnSickLeave" | "Intern" | "Fired";

export function isAvailableDriverStatus(status: DriverStatus): boolean {
  return status === "OnWork" || status === "DayOff";
}


// Карта статусов автобусов
export const BUS_STATUS_MAP: Record<string, StatusType> = {
  OnWork: { label: "На линии", color: "green" },
  DayOff: { label: "Выходной", color: "yellow" },
  UnderRepair: { label: "На ремонте", color: "red" },
  LongTermRepair: { label: "Долгий ремонт", color: "red" },
  Decommissioned: { label: "Списан", color: "gray" },
  assigned: { label: "Назначен", color: "yellow" }, // Дополнительно для назначенных
  available: { label: "Свободен", color: "green" }, // Дополнительно для свободных
};

// Карта статусов водителей
export const DRIVER_STATUS_MAP: Record<string, StatusType> = {
  OnWork: { label: "На работе", color: "green" },
  DayOff: { label: "Выходной", color: "yellow" },
  OnVacation: { label: "Отпуск", color: "red" },
  OnSickLeave: { label: "Больничный", color: "red" },
  Intern: { label: "Стажёр", color: "gray" },
  Fired: { label: "Уволен", color: "gray" },
  assigned: { label: "Назначен", color: "yellow" }, // Дополнительно для назначенных
  available: { label: "Доступен", color: "green" }, // Дополнительно для свободных
};

// Универсальная функция получения статуса
export function getStatus(
  statusMap: Record<string, StatusType>,
  statusKey: string,
  defaultLabel = "Неизвестно"
): StatusType {
  return statusMap[statusKey] ?? { label: defaultLabel, color: "gray" };
}
