// ✅ useFilteredBuses — упрощённый

"use client";

import { useMemo } from "react";
import type { DisplayBus } from "@/types/bus.types";

export function useFilteredBuses(
  buses: DisplayBus[],
  searchQuery: string
) {
  const filtered = useMemo(() => {
    const query = searchQuery?.toLowerCase?.() ?? "";

    return buses.filter((bus) =>
      bus.garageNumber.toLowerCase().includes(query) ||
      (bus.stateNumber ?? "").toLowerCase().includes(query) ||
      bus.govNumber.toLowerCase().includes(query)
    );
  }, [buses, searchQuery]);

  return filtered;
}
