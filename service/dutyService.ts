// services/dutyService.ts

import apiClient from "@/app/api/apiClient"
import type { DutyApiResponse } from "@/types/releasePlanTypes"
import type { ApiResponse } from "@/types/api.types"

export const dutyService = {
  /**
   * Получить дежурную разнарядку по депо на указанную дату и статус маршрута
   * @param depotId - ID автобусного парка
   * @param date - Дата в формате YYYY-MM-DD
   * @param routeStatus - Статус маршрута (например, Active, All)
   */
  async getByDepotAndDate(
    depotId: string,
    date: string,
    routeStatus: string = "All"
  ): Promise<ApiResponse<DutyApiResponse[]>> {
    try {
      const response = await apiClient.get(`/dispatches/duta/by-depot/${depotId}/${date}`, {
        params: { routeStatus },
      })
      return response.data
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error?.message || "Ошибка при получении данных",
        value: null,
        statusCode: 500,
      }
    }
  },
}
