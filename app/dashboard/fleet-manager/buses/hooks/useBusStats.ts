import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { busService } from "@/service/busService";
import type { BusStatsData } from "@/types/bus.types";

export const useBusStats = (convoyId?: string): UseQueryResult<BusStatsData, Error> => {
  return useQuery<BusStatsData, Error, BusStatsData, readonly [string, string | undefined]>({
    queryKey: ["busStats", convoyId] as const,
    queryFn: async (): Promise<BusStatsData> => {
      if (!convoyId) throw new Error("convoyId is required");
      const res = await busService.getStatusStats(convoyId);
      const stats = res.value as BusStatsData;

      const total =
        (stats.OnWork || 0) +
        (stats.UnderRepair || 0) +
        (stats.LongTermRepair || 0) +
        (stats.DayOff || 0) +
        (stats.Decommissioned || 0);

      return { ...stats, total };
    },
    enabled: !!convoyId,
  });
};