import { useQuery } from "@tanstack/react-query"
import { statisticService } from "@/service/statisticService"
import type { DispatchRepairResponse } from "@/types/statistic.types"

export function useDispatchRepairStats(depotId: string, startDate: string, endDate: string) {
  return useQuery<DispatchRepairResponse>({
    queryKey: ["dispatch-repair", depotId, startDate, endDate],
    queryFn: () => statisticService.getDispatchRepairStats(depotId, startDate, endDate),
    enabled: !!depotId,
  })
}
