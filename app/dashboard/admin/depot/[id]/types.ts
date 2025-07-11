export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "fleetManager" | "mechanic" | "admin" | "mechanicOnDuty" | "dispatcher" | "seniorDispatcher" | "hr" |"CTS" |"MCC" | "taskInspector" | "LRT" | "Guide"
  position?: string;
  avatar?: string;
  busDepotId?: string;
  convoyId?: string;
  convoyNumber?: number;
}

export interface BusDepot {
  id: string;
  name: string;
  city: string;
  address: string;
  logo?: string;
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

// Обновленный интерфейс Convoy
export interface Convoy {
  id: string;
  number: number;
  busDepotId: string;
  chiefId?: string;    // Для совместимости с POST/PUT
  mechanicId?: string; // Для совместимости с POST/PUT
  chief?: { id: string; fullName: string };    // Из GET /by-depot/{id}
  mechanic?: { id: string; fullName: string }; // Из GET /by-depot/{id}
  busIds?: string[];
  buses?: any[]; // Если структура buses отличается, уточните
  driversCount?: number;
}

export interface UserFormData {
  fullName: string;
  email: string;
  login: string;
  password: string;
  role: "fleetManager" | "mechanic" | "admin" | "mechanicOnDuty" | "dispatcher" | "seniorDispatcher" | "hr" |"CTS" |"MCC" | "taskInspector" | "LRT" |"Guide"
  position: string;
  busDepotId: string;
  convoyId?: string;
  convoyNumber?: number;
}

export interface ConvoyFormData {
  id?: string;
  number: string;
  chiefId: string;
  mechanicId: string;
}
export interface UpdateUserRequest {
  fullName: string;
  role: string;
  convoyId?: string; // Добавляем для обновления
}