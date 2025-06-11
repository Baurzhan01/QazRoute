// service/routeExitRepairService.ts

import apiClient from "@/app/api/apiClient"
import type { ApiResponse } from "@/types/api.types"
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types"


export const routeExitRepairService = {
  // 📥 Создание новой записи
  create: async (data: RouteExitRepairDto): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.post("/route-exits-repair", data)
    return res.data
  },

  // 🔍 Получение по ID
  getById: async (id: string): Promise<ApiResponse<RouteExitRepairDto>> => {
    const res = await apiClient.get(`/route-exits-repair/${id}`)
    return res.data
  },

  getStatsByDate: async (
    depotId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<number>> => {
    try {
      const res = await apiClient.get(`/route-exits-repair/stats/by-date`, {
        params: { depotId, startDate, endDate },
      });
      return res.data;
    } catch (error) {
      return { isSuccess: false, error: "Не удалось получить статистику", statusCode: 500, value: null };
    }
  },

  // ✏️ Обновление по ID
  update: async (id: string, data: RouteExitRepairDto): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.put(`/route-exits-repair/${id}`, data)
    return res.data
  },

  // ❌ Удаление по ID
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.delete(`/route-exits-repair/${id}`)
    return res.data
  },

  // 📅 Получение всех за дату
  getByDate: async (date: string): Promise<ApiResponse<RouteExitRepairDto[]>> => {
    const res = await apiClient.get(`/route-exits-repair/by-date`, {
      params: { date },
    })
    return res.data
  },

  // 📅+🛠 Получение за дату и колонну
  getByDateAndConvoy: async (
    date: string,
    convoyId: string
  ): Promise<ApiResponse<RouteExitRepairDto[]>> => {
    const res = await apiClient.get(`/route-exits-repair/by-date-and-convoy`, {
      params: { date, convoyId },
    })
    return res.data
  },
}
