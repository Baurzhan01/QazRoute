import { BusLine } from "@/app/dashboard/fleet-manager/routes/types";
// types/route.types.ts
export type RouteStatus = "Workday" | "Saturday" | "Sunday";
export type DayType = "workdays" | "saturday" | "sunday"

export interface Station {
  id: string
  name: string
  convoyId: string
  convoyNumber: number
}

export interface RouteFormData {
  name: string
  exitNumbers: string
  orderInSchedule: string
  additionalInfo: string
  stationId: string
  dayType: DayType
}

export interface RouteAssignment {
  routeNumber: string
  garageNumber: string
  stateNumber: string
  departureTime: string
  scheduleTime: string
  endTime: string
  additionalInfo: string
}

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
  busLineNumbers: string[];
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  error: string | null;
  statusCode: number;
  value: T | null;
}