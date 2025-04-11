import { useQuery } from "@tanstack/react-query"
import { busService } from "@/service/busService"
import type { BusStatsData } from "@/types/bus.types"

export const useBusStats = (convoyId?: string) => {
  return useQuery<BusStatsData>({
    queryKey: ["busStats", convoyId],
    queryFn: async () => {
      if (!convoyId) throw new Error("convoyId is required")
      const res = await busService.getStatusStats(convoyId)
      const stats = res.value

      const total =
        (stats.OnWork || 0) +
        (stats.UnderRepair || 0) +
        (stats.LongTermRepair || 0) +
        (stats.DayOff || 0) +
        (stats.Decommissioned || 0)

      return { ...stats, total } // 👈 теперь total есть!
    },
    enabled: !!convoyId,
  })
}
