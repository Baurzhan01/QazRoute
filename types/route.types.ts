import { BusLine } from "@/app/dashboard/fleet-manager/routes/types";

// types/route.types.ts
export type RouteStatus = "Workday" | "Saturday" | "Sunday";

export interface Route {
  id?: string;
  convoyId: string;
  routeStatus: RouteStatus;
  busLines: BusLine[];
  number: string;
  queue: number;
}

export interface CreateRouteRequest {
  convoyId: string;
  routeStatus: RouteStatus;
  number: string;
  queue: number;
}

export interface UpdateRouteRequest {
  convoyId: string;
  routeStatus: RouteStatus;
  number: string;
  queue: number;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  error: string | null;
  statusCode: number;
  value: T | null;
}