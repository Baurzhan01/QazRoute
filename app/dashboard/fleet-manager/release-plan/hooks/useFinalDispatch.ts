"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { releasePlanService } from "@/service/releasePlanService";
import { convoyService } from "@/service/convoyService";
import { busService } from "@/service/busService";
import { driverService } from "@/service/driverService";
import { getAuthData } from "@/lib/auth-utils";

import type { FinalDispatchData } from "@/types/releasePlanTypes";
import type { ConvoySummary } from "@/types/convoy.types";

export function useFinalDispatch(date: Date) {
  const dateStr = useMemo(() => date.toISOString().split("T")[0], [date]);
  const auth = getAuthData();
  const convoyId = auth?.convoyId;

  const {
    data,
    isLoading,
    error,
  } = useQuery<{
    finalDispatch: FinalDispatchData;
    convoySummary?: Pick<ConvoySummary, "driverOnWork" | "busOnWork" | "totalDrivers" | "totalBuses">;
    convoyNumber?: number;
    driversCount: number;
    busesCount: number;
  }>({
    queryKey: ["finalDispatch", dateStr, convoyId],
    enabled: !!dateStr && !!convoyId,
    queryFn: async () => {
      if (!convoyId) throw new Error("convoyId отсутствует");

      const [
        dispatchRes,
        reserveRes,
        summaryRes,
        convoyDetailsRes,
        weekendDriversRes,
        weekendBusesRes,
        sickLeaveDriversRes,
        vacationDriversRes,
        internDriversRes,
        repairBusesRes,
      ] = await Promise.all([
        releasePlanService.getFullDispatchByDate(dateStr, convoyId),
        releasePlanService.getReserveAssignmentsByDate(dateStr),
        convoyService.getConvoySummary(convoyId, dateStr),
        convoyService.getById(convoyId),
        driverService.getWeekendDrivers(dateStr, convoyId),
        busService.getWeekendBuses(dateStr, convoyId),
        driverService.filter({
          convoyId,
          driverStatus: "OnSickLeave",
          fullName: null,
          serviceNumber: null,
          address: null,
          phone: null,
          page: 1,
          pageSize: 100,
        }),
        driverService.filter({
          convoyId,
          driverStatus: "OnVacation",
          fullName: null,
          serviceNumber: null,
          address: null,
          phone: null,
          page: 1,
          pageSize: 100,
        }),
        driverService.filter({
          convoyId,
          driverStatus: "Intern",
          fullName: null,
          serviceNumber: null,
          address: null,
          phone: null,
          page: 1,
          pageSize: 100,
        }),
        busService.filter({
          convoyId,
          busStatus: "UnderRepair",
          page: 1,
          pageSize: 100,
        }),
      ]);

      const convoyNumber = convoyDetailsRes.isSuccess ? convoyDetailsRes.value?.number : undefined;

      const routes = dispatchRes.value?.routes ?? [];
      const reserves = reserveRes.isSuccess ? reserveRes.value ?? [] : [];

      const finalDispatch: FinalDispatchData = {
        date: dateStr,
        routeGroups: routes.map((route: any) => ({
          routeId: route.routeId,
          routeNumber: route.routeNumber,
          assignments: (route.busLines ?? []).map((line: any) => ({
            dispatchBusLineId: line.dispatchBusLineId,
            garageNumber: line.bus?.garageNumber ?? "—",
            stateNumber: line.bus?.govNumber ?? "—",
            driver: line.firstDriver
              ? {
                  serviceNumber: line.firstDriver.serviceNumber ?? "—",
                  fullName: line.firstDriver.fullName ?? "—",
                }
              : null,
            departureTime: line.exitTime ?? "—",
            scheduleTime: line.scheduleStart ?? "—",
            additionalInfo: line.description ?? "—",
            shift2Driver: line.secondDriver
              ? {
                  serviceNumber: line.secondDriver.serviceNumber ?? "—",
                  fullName: line.secondDriver.fullName ?? "—",
                }
              : undefined,
            shift2AdditionalInfo: line.shift2Description ?? "—",
            endTime: line.endTime ?? "—",
          })),
        })),
        reserveAssignments: reserves.map((r: any, index: number) => ({
          dispatchBusLineId: r.dispatchBusLineId ?? "",
          sequenceNumber: index + 1,
          garageNumber: r.garageNumber ?? "—",
          stateNumber: r.govNumber ?? "—",
          driver: {
            serviceNumber: r.driverTabNumber ?? "—",
            fullName: r.driverFullName ?? "—",
          },
          departureTime: "—",
          scheduleTime: "—",
          additionalInfo: r.description ?? "—",
          shift2Driver: undefined,
          endTime: r.endTime ?? "—",
        })),
        repairBuses:
          repairBusesRes.items?.map((b) => `${b.garageNumber} (${b.govNumber})`) ?? [],
        dayOffBuses:
          weekendBusesRes.value?.map((b) => `${b.garageNumber} (${b.govNumber})`) ?? [],
        driverStatuses: {
          OnSickLeave:
            sickLeaveDriversRes.value?.items?.map((d) => d.fullName) ?? [],
          OnVacation:
            vacationDriversRes.value?.items?.map((d) => d.fullName) ?? [],
          Intern: internDriversRes.value?.items?.map((d) => d.fullName) ?? [],
          DayOff: weekendDriversRes.value?.map((d) => d.fullName) ?? [], // ✅ В
        },
      };

      const uniqueDrivers = new Set<string>();
      const uniqueBuses = new Set<string>();

      finalDispatch.routeGroups.forEach((group) =>
        group.assignments.forEach((a) => {
          if (a.driver?.serviceNumber) uniqueDrivers.add(a.driver.serviceNumber);
          if (a.shift2Driver?.serviceNumber)
            uniqueDrivers.add(a.shift2Driver.serviceNumber);
          if (a.garageNumber) uniqueBuses.add(a.garageNumber);
        })
      );

      finalDispatch.reserveAssignments.forEach((r) => {
        if (r.driver?.serviceNumber)
          uniqueDrivers.add(r.driver.serviceNumber);
        if (r.garageNumber) uniqueBuses.add(r.garageNumber);
      });

      const driversCount = uniqueDrivers.size;
      const busesCount = uniqueBuses.size;

      const convoySummary = summaryRes.isSuccess && summaryRes.value
        ? {
            driverOnWork: summaryRes.value.driverOnWork,
            busOnWork: summaryRes.value.busOnWork,
            totalDrivers: summaryRes.value.totalDrivers,
            totalBuses: summaryRes.value.totalBuses,
          }
        : undefined;

      return {
        finalDispatch,
        convoySummary,
        convoyNumber,
        driversCount,
        busesCount,
      };
    },
  });

  return {
    finalDispatch: data?.finalDispatch ?? null,
    convoySummary: data?.convoySummary,
    convoyNumber: data?.convoyNumber ?? undefined,
    driversCount: data?.driversCount ?? 0,
    busesCount: data?.busesCount ?? 0,
    loading: isLoading,
    error: error?.message ?? null,
  };
}
