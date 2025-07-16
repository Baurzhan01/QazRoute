import { useQuery } from "@tanstack/react-query"
import { statisticService } from "@/service/statisticService"
import type { DailyDepotStat } from "@/types/statistic.types"

export function useDispatchRepairStats(depotId: string, startDate: string, endDate: string) {
  return useQuery<DailyDepotStat[]>({
    queryKey: ["dispatch-repair", depotId, startDate, endDate],
    queryFn: () => statisticService.getDispatchRepairStats(depotId, startDate, endDate),
    enabled: !!depotId,
  })
}
