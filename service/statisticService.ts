import apiClient from "@/app/api/apiClient"

export const statisticService = {
  async getDispatchRepairStats(depotId: string, startDate: string, endDate: string) {
    const response = await apiClient.get("/statistic/dispatch-repair", {
      params: { depotId, startDate, endDate },
    })
    return response.data
  },
}
