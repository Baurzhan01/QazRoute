"use client";

import { useQuery } from "@tanstack/react-query";
import { releasePlanService } from "@/service/releasePlanService";
import { busService } from "@/service/busService";
import { driverService } from "@/service/driverService";

import type { Departure } from "@/types/releasePlanTypes";
import type { DisplayBus } from "@/types/bus.types";
import type { DisplayDriver } from "@/types/driver.types";
import type { Schedule, BusLineAssignment } from "@/types/schedule.types";
import type { Driver as ApiDriver } from "@/types/driver.types";
import type { Bus as ApiBus } from "@/types/bus.types";

interface UseRouteAssignmentsResult {
  departures: Departure[];
  buses: DisplayBus[];
  drivers: DisplayDriver[];
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

  return useQuery<UseRouteAssignmentsResult>({
    queryKey: ["routeAssignments", routeId, dateStr],
    queryFn: async () => {
      const [dispatchRes, busRes, driverRes, fullDispatchRes] = await Promise.all([
        releasePlanService.getRouteDetails(routeId, dateStr),
        busService.getAll(),
        driverService.getAll(),
        releasePlanService.getFullDispatchByDate(dateStr),
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
      const globalRouteNumber = fullDispatchRes.value?.routeNumber ?? "Неизвестно";

      // Глобальные назначения
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

      // Локальные назначения
      (routeValue.busLines ?? []).forEach((line: BusLineAssignment, index) => {
        const departureNumber = index + 1;

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

      const busesMap: Record<string, ApiBus> = {};
      (busRes.value || []).forEach((bus: ApiBus) => {
        busesMap[bus.id] = bus;
      });


      const driversMap: Record<string, ApiDriver> = {};
      (driverRes.value || [])
        .filter((driver): driver is ApiDriver & { id: string } => !!driver.id)
        .forEach((driver) => {
          driversMap[driver.id] = driver;
        });

      const departures: Departure[] = (routeValue.busLines ?? []).map(
        (line: BusLineAssignment, index: number) => {
          const driver1Id = line.driver1?.id;
          const driver2Id = line.driver2?.id;

          return {
            id: line.id,
            departureNumber: index + 1,
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
            bus: line.bus && busesMap[line.bus.id]
              ? {
                  id: line.bus.id,
                  garageNumber: line.bus.garageNumber,
                  govNumber: line.bus.govNumber,
                  stateNumber: line.bus.govNumber,
                  status: busesMap[line.bus.id].busStatus || "available",
                  isAssigned: true,
                  assignedRoute: currentRouteNumber,
                  assignedDeparture: index + 1,
                }
              : undefined,
            driver: driver1Id && driversMap[driver1Id]
              ? {
                  id: driver1Id,
                  fullName: line.driver1!.fullName,
                  serviceNumber: line.driver1!.serviceNumber,
                  driverStatus: driversMap[driver1Id].driverStatus,
                  isAssigned: true,
                  assignedRoute: currentRouteNumber,
                  assignedDeparture: index + 1,
                }
              : undefined,
            shift2Driver: driver2Id && driversMap[driver2Id]
              ? {
                  id: driver2Id,
                  fullName: line.driver2!.fullName,
                  serviceNumber: line.driver2!.serviceNumber,
                  driverStatus: driversMap[driver2Id].driverStatus,
                  isAssigned: true,
                  assignedRoute: currentRouteNumber,
                  assignedDeparture: index + 1,
                }
              : undefined,
          };
        }
      );

      const buses: DisplayBus[] = (busRes.value || []).map((bus: ApiBus) => ({
        id: bus.id,
        garageNumber: bus.garageNumber,
        govNumber: bus.govNumber,
        stateNumber: bus.govNumber,
        status: bus.busStatus || "available",
        isAssigned: false,
      }));      

      const drivers: DisplayDriver[] = (driverRes.value || [])
        .filter((d): d is ApiDriver & { id: string } => !!d.id)
        .map((d) => ({
          id: d.id,
          fullName: d.fullName,
          serviceNumber: d.serviceNumber,
          driverStatus: d.driverStatus,
          isAssigned: !!d.busId,
          assignedRoute: undefined,
          assignedDeparture: undefined,
        }));

      return {
        departures,
        buses,
        drivers,
        schedules: [],
        dispatchRouteId: routeValue.id,
        routeNumber: routeValue.routeNumber,
        assignedBusesMap,
        assignedDriversMap,
        globalAssignedBusesMap,
        globalAssignedDriversMap,
      };
    },
    enabled: !!routeId && !!dateStr,
  });
}
