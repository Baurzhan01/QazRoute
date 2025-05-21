"use client";

import { useQuery } from "@tanstack/react-query";
import { releasePlanService } from "@/service/releasePlanService";
import { getAuthData } from "@/lib/auth-utils";

import type { Departure } from "@/types/releasePlanTypes";
import type { DisplayBus } from "@/types/bus.types";
import type { DisplayDriver } from "@/types/driver.types";
import type { Schedule, BusLineAssignment } from "@/types/schedule.types";

interface UseRouteAssignmentsResult {
  departures: Departure[];
  schedules: Schedule[];
  dispatchRouteId: string;
  routeNumber: string;
  assignedBusesMap: Record<string, { routeNumber: string; departureNumber: number }>;
  assignedDriversMap: Record<string, { routeNumber: string; departureNumber: number }>;
  globalAssignedBusesMap: Record<string, { routeNumber: string; departureNumber: number }>;
  globalAssignedDriversMap: Record<string, { routeNumber: string; departureNumber: number }>;
}

function formatTime(timeObj: { hour: number; minute: number } | null | undefined): string {
  if (!timeObj) return "";
  const hours = String(timeObj.hour ?? 0).padStart(2, "0");
  const minutes = String(timeObj.minute ?? 0).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function useRouteAssignments(routeId: string, date: Date) {
  const dateStr = date.toISOString().split("T")[0];
  const auth = getAuthData();
  const convoyId = auth?.convoyId;

  return useQuery<UseRouteAssignmentsResult>({
    queryKey: ["routeAssignments", routeId, dateStr],
    enabled: !!routeId && !!dateStr && !!convoyId,
    queryFn: async () => {
      if (!convoyId) throw new Error("convoyId не найден");

      const [dispatchRes, fullDispatchRes] = await Promise.all([
        releasePlanService.getRouteDetails(routeId, dateStr),
        releasePlanService.getFullDispatchByDate(dateStr, convoyId),
      ]);

      if (!dispatchRes.isSuccess || !dispatchRes.value) {
        throw new Error(dispatchRes.error || "Ошибка загрузки маршрута");
      }

      const routeValue = dispatchRes.value;

      const assignedBusesMap: Record<string, { routeNumber: string; departureNumber: number }> = {};
      const assignedDriversMap: Record<string, { routeNumber: string; departureNumber: number }> = {};
      const globalAssignedBusesMap: Record<string, { routeNumber: string; departureNumber: number }> = {};
      const globalAssignedDriversMap: Record<string, { routeNumber: string; departureNumber: number }> = {};

      const currentRouteNumber = routeValue.routeNumber;
      const globalRouteNumber = fullDispatchRes.value?.routeNumber ?? "—";

      (fullDispatchRes.value?.busLines ?? []).forEach((line: BusLineAssignment) => {
        const departureNumber = parseInt(line.busLine.number, 10);

        if (line.bus) {
          globalAssignedBusesMap[line.bus.id] = { routeNumber: globalRouteNumber, departureNumber };
        }
        if (line.driver1) {
          globalAssignedDriversMap[line.driver1.id] = { routeNumber: globalRouteNumber, departureNumber };
        }
        if (line.driver2) {
          globalAssignedDriversMap[line.driver2.id] = { routeNumber: globalRouteNumber, departureNumber };
        }
      });

      (routeValue.busLines ?? []).forEach((line: BusLineAssignment) => {
        const departureNumber = parseInt(line.busLine.number, 10);

        if (line.bus) {
          assignedBusesMap[line.bus.id] = { routeNumber: currentRouteNumber, departureNumber };
        }
        if (line.driver1) {
          assignedDriversMap[line.driver1.id] = { routeNumber: currentRouteNumber, departureNumber };
        }
        if (line.driver2) {
          assignedDriversMap[line.driver2.id] = { routeNumber: currentRouteNumber, departureNumber };
        }
      });

      const departures: Departure[] = (routeValue.busLines ?? []).map((line: BusLineAssignment) => {
        const busLineNumber = parseInt(line.busLine.number, 10) || 0;

        return {
          id: line.id,
          departureNumber: busLineNumber,
          departureTime:
            typeof line.busLine.exitTime === "string"
              ? line.busLine.exitTime
              : formatTime(line.busLine.exitTime),
          scheduleTime:
            line.scheduleStart && typeof line.scheduleStart === "object"
              ? formatTime(line.scheduleStart)
              : "",
          shift2Time:
            line.scheduleShiftChange && typeof line.scheduleShiftChange === "object"
              ? formatTime(line.scheduleShiftChange)
              : "",
          endTime:
            typeof line.busLine.endTime === "string"
              ? line.busLine.endTime
              : formatTime(line.busLine.endTime),
          additionalInfo: "",
          shift2AdditionalInfo: "",
          isModified: false,
          bus: line.bus
            ? {
                id: line.bus.id,
                garageNumber: line.bus.garageNumber,
                govNumber: line.bus.govNumber,
                stateNumber: line.bus.govNumber,
                status: "OnWork",
                isAssigned: true,
                assignedRoute: currentRouteNumber,
                assignedDeparture: busLineNumber,
              }
            : undefined,
          driver: line.driver1
            ? {
                id: line.driver1.id,
                fullName: line.driver1.fullName,
                serviceNumber: line.driver1.serviceNumber,
                driverStatus: "OnWork",
                isAssigned: true,
                assignedRoute: currentRouteNumber,
                assignedDeparture: busLineNumber,
              }
            : undefined,
          shift2Driver: line.driver2
            ? {
                id: line.driver2.id,
                fullName: line.driver2.fullName,
                serviceNumber: line.driver2.serviceNumber,
                driverStatus: "OnWork",
                isAssigned: true,
                assignedRoute: currentRouteNumber,
                assignedDeparture: busLineNumber,
              }
            : undefined,
          busLine: {
            id: line.busLine.id,
            number: line.busLine.number,
            exitTime: line.busLine.exitTime,
            endTime: line.busLine.endTime,
          },
        };
      });

      return {
        departures,
        schedules: [],
        dispatchRouteId: routeValue.id,
        routeNumber: routeValue.routeNumber,
        assignedBusesMap,
        assignedDriversMap,
        globalAssignedBusesMap,
        globalAssignedDriversMap,
      };
    },
  });
}
