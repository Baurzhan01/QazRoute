import type { BusLine } from "@/types/busLine.types";
import type { Route, RouteStatus } from "@/types/route.types";

export type { Route, BusLine, RouteStatus };

export interface RouteFormData {
  routeStatus: RouteStatus;
  number: string;
  queue: number;
  exitNumbers: string; // Добавляем поле для номеров выходов
}

export interface UserContext {
  userId: string;
  userName: string;
  convoyId: string;
  convoyNumber: number;
}