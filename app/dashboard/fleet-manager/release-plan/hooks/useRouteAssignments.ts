"use client";

import { useQuery } from "@tanstack/react-query";
import { releasePlanService } from "@/service/releasePlanService";
import { getAuthData } from "@/lib/auth-utils";

import type { Departure } from "@/types/releasePlanTypes";
import type { DisplayBus } from "@/types/bus.types";
import type { DisplayDriver } from "@/types/driver.types";
import type { Schedule } from "@/types/schedule.types";

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
      const routeGroups = fullDispatchRes.value?.routeGroups ?? [];
      const globalRouteNumber = routeGroups[0]?.routeNumber ?? "—";

      const assignedBusesMap: Record<string, { routeNumber: string; departureNumber: number }> = {};
      const assignedDriversMap: Record<string, { routeNumber: string; departureNumber: number }> = {};
      const globalAssignedBusesMap: Record<string, { routeNumber: string; departureNumber: number }> = {};
      const globalAssignedDriversMap: Record<string, { routeNumber: string; departureNumber: number }> = {};

      // 🔁 Нормализация routeGroups
      const allAssignments = routeGroups.flatMap(group =>
        group.assignments.map((a, index) => ({
          ...a,
          routeNumber: group.routeNumber,
          departureNumber: index + 1,
        }))
      );

      allAssignments.forEach((a) => {
        const departureNumber = a.departureNumber ?? 0;
        if (a.garageNumber) {
          globalAssignedBusesMap[a.garageNumber] = {
            routeNumber: a.routeNumber,
            departureNumber,
          };
        }
        if (a.driver?.serviceNumber) {
          globalAssignedDriversMap[a.driver.serviceNumber] = {
            routeNumber: a.routeNumber,
            departureNumber,
          };
        }
        if (a.shift2Driver?.serviceNumber) {
          globalAssignedDriversMap[a.shift2Driver.serviceNumber] = {
            routeNumber: a.routeNumber,
            departureNumber,
          };
        }
      });

      (routeValue.busLines ?? []).forEach((line) => {
        const departureNumber = parseInt(line.busLine.number, 10) || 0;
        if (line.bus) {
          assignedBusesMap[line.bus.id] = { routeNumber: routeValue.routeNumber, departureNumber };
        }
        if (line.driver1) {
          assignedDriversMap[line.driver1.id] = { routeNumber: routeValue.routeNumber, departureNumber };
        }
        if (line.driver2) {
          assignedDriversMap[line.driver2.id] = { routeNumber: routeValue.routeNumber, departureNumber };
        }
      });

      const departures: Departure[] = (routeValue.busLines ?? []).map((line) => {
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
                busStatus: "OnWork",
                isAssigned: true,
                assignedRoute: routeValue.routeNumber,
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
                assignedRoute: routeValue.routeNumber,
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
                assignedRoute: routeValue.routeNumber,
                assignedDeparture: busLineNumber,
              }
            : undefined,
          busLine: {
            id: line.busLine.id,
            number: line.busLine.number,
            exitTime:
              typeof line.busLine.exitTime === "string"
                ? line.busLine.exitTime
                : formatTime(line.busLine.exitTime),
            endTime:
              typeof line.busLine.endTime === "string"
                ? line.busLine.endTime
                : formatTime(line.busLine.endTime),
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
