"use client";

import { useMemo } from "react";
import type { DisplayBus } from "@/types/bus.types";

export function useFilteredBuses(
  buses: DisplayBus[],
  searchQuery: string,
  assignedBusIds: string[]
) {
  const filtered = useMemo(() => {
    const query = searchQuery?.toLowerCase?.() ?? "";

    const validStatuses: DisplayBus["status"][] = ["OnWork", "DayOff"];

    let result = buses.filter((bus) =>
      validStatuses.includes(bus.status)
    );

    result = result.filter((bus) => !assignedBusIds.includes(bus.id));

    if (query) {
      result = result.filter(
        (bus) =>
          bus.garageNumber.toLowerCase().includes(query) ||
          (bus.stateNumber ?? "").toLowerCase().includes(query) ||
          bus.govNumber.toLowerCase().includes(query)
      );
    }

    return result;
  }, [buses, searchQuery, assignedBusIds]);

  return filtered;
}
