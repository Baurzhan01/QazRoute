// Типы данных для работы с API

export interface ApiResponse<T> {
  isSuccess: boolean;
  error?: string;
  statusCode: number;
  value: T | null;
}

export type UserRole =
  | "fleetManager"
  | "mechanic"
  | "admin"
  | "mechanicOnDuty"
  | "dispatcher"
  | "seniorDispatcher"
  | "hr"
  | "taskInspector"
  | "CTS" 
  | "MCC"
  | "Guide"
  | "LRT" // ← добавляем новую роль

export interface Bus {
  id?: string;
  govNumber: string;
  garageNumber: string;
  additionalInfo: string;
  busLineId: string;
  busStatus: "OnWork" | "UnderRepair" | "LongTermRepair" | "DayOff" | "Decommissioned";
  convoyId: string;
  busDepotId?: string;
}

export interface BusDepot {
  id: string
  name: string
  city: string
  address: string
  fleetManagerCount: number
  mechanicCount: number
  otherEmployeesCount: number
  employeesCount: number
}
export interface CreateDepotRequest {
  name: string
  city: string
  address: string
}

export interface Convoy {
  id: string;
  busDepotId: string;
  chiefId?: string;
  mechanicId?: string;
  number: number;
  busIds: string[];
}

export interface Driver {
  id?: string;
  fullName: string;
  serviceNumber: string;
  address: string;
  phone: string;
  birthDate: {
    year: number;
    month: number;
    day: number;
    dayOfWeek?: number;
  };
  additionalInfo: string;
  driverStatus: "OnWork" | "DayOff" | "OnVacation" | "OnSickLeave" | "Intern" | "Fired";
  busId?: string;
  busDepotId?: string;
  convoyId?: string;
}

export interface Route {
  id?: string;
  number: string;
  scheduleIds?: string[];
}

export interface Schedule {
  id?: string;
  busLineId: string;
  namePoint: string;
  routeId?: string;
}

export interface Revolution {
  id?: string;
  scheduleId: string;
  startTime: string; // ISO формат
  endTime: string; // ISO формат
}

export interface AuthRequest {
  login: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  login: string;
  password: string;
  role: "fleetManager" | "mechanic" | "admin" | "mechanicOnDuty" | "dispatcher" | "seniorDispatcher" | "hr" |"CTS" |"MCC" | "taskInspector" | "LRT" |"Guide"
  busDepotId?: string;
  convoyId?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  login: string;
  role: "fleetManager" | "mechanic" | "admin" | "mechanicOnDuty" | "dispatcher" | "seniorDispatcher" | "hr" |"CTS" |"MCC" | "taskInspector" | "LRT" |"Guide"
  busDepotId?: string;
  convoyId?: string;
  convoyNumber?: number;
}

export interface FleetStats {
  totalBuses: number;
  activeRoutes: number;
  drivers: number;
  maintenanceBuses: number;
}

export interface FleetStatus {
  operational: number; // Процент
  inMaintenance: number; // Процент
  outOfService: number; // Процент
}

export interface FuelConsumption {
  thisMonth: number;
  lastMonth: number;
  efficiency: number;
}

export interface MaintenanceStatus {
  completed: number;
  scheduled: number;
  overdue: number;
}

export interface Alert {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp: string; // ISO формат
}

export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  date: string; // ISO формат
  icon: "clock" | "file" | "users";
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  role: User["role"];
  busDepotId: string;
  convoyId?: string;
  convoyNumber?: number;
}