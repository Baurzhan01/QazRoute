import apiClient from "@/app/api/apiClient"
import type { ConvoyDispatchRepairStat } from "@/types/statistic.types"
import type { DepotDispatchRepairResponse } from "@/types/statistic.types"

export const statisticService = {
  async getDispatchRepairStats(depotId: string, startDate: string, endDate: string) {
    const response = await apiClient.get<DepotDispatchRepairResponse>("/statistic/dispatch-repair", {
      params: { depotId, startDate, endDate },
    })
    return response.data.value // 👈 вытаскиваем только .value из ответа
  },
  async getConvoyDispatchRepairStats(
    depotId: string,
    startDate: string,
    endDate: string
  ): Promise<ConvoyDispatchRepairStat> {
    const res = await apiClient.get<ConvoyDispatchRepairStat>("/statistic/convoy-dispatch-repair", {
      params: { depotId, startDate, endDate },
    })
    return res.data
  },  
}
