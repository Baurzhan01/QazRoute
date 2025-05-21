"use client";

import { useMemo } from "react";
import type { DisplayDriver } from "@/types/driver.types";

export function useFilteredDrivers(
  drivers: DisplayDriver[],
  searchQuery: string
) {
  return useMemo(() => {
    const query = searchQuery?.toLowerCase?.() ?? "";

    if (!query) return drivers;

    return drivers.filter(
      (driver) =>
        driver.fullName.toLowerCase().includes(query) ||
        driver.serviceNumber.toLowerCase().includes(query)
    );
  }, [drivers, searchQuery]);
}
