"use client";

import { useMemo } from "react";
import type { DisplayDriver } from "@/types/driver.types";

export function useFilteredDrivers(
  drivers: DisplayDriver[],
  assignedDriverIds: string[],
  selectedBusIds: string[],
  searchQuery: string
) {
  const filtered = useMemo(() => {
    const query = searchQuery?.toLowerCase?.() ?? "";

    const validStatuses: DisplayDriver["driverStatus"][] = ["OnWork", "DayOff"];

    let result = drivers.filter(
      (driver) =>
        validStatuses.includes(driver.driverStatus) &&
        !assignedDriverIds.includes(driver.id)
    );

    // Фильтрация если выбраны автобусы (busIds есть у DisplayDriver)
    if (selectedBusIds.length > 0) {
      result = result.filter((driver) =>
        (driver.busIds ?? []).some((busId) => selectedBusIds.includes(busId))
      );
    }

    if (query) {
      result = result.filter(
        (driver) =>
          driver.fullName.toLowerCase().includes(query) ||
          driver.serviceNumber.toLowerCase().includes(query)
      );
    }

    return result;
  }, [drivers, assignedDriverIds, selectedBusIds, searchQuery]);

  return filtered;
}
