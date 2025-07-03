// service/routeExitRepairService.ts

import apiClient from "@/app/api/apiClient"
import type { ApiResponse } from "@/types/api.types"
import type { CreateRouteExitRepairDto, RouteExitRepairDto, RouteExitRepairStatus, BusRepairStatsResponse } from "@/types/routeExitRepair.types"


export const routeExitRepairService = {
  // 📥 Создание новой записи
  create: async (data: CreateRouteExitRepairDto): Promise<ApiResponse<boolean>> => {
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
  ): Promise<ApiResponse<{ total: number; byConvoy: Record<string, number> }>> => {
    try {
      const res = await apiClient.get(`/route-exits-repair/stats/by-date`, {
        params: { depotId, startDate, endDate },
      })
      return res.data
    } catch (error) {
      return {
        isSuccess: false,
        error: "Не удалось получить статистику",
        statusCode: 500,
        value: null,
      }
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

  getByDate: async (
    date: string,
    depotId: string
  ): Promise<ApiResponse<RouteExitRepairDto[]>> => {
    const res = await apiClient.get(`/route-exits-repair/by-date`, {
      params: { date, depotId },
    })
    return res.data
  }, 
  
  replaceDriver: async (
    driverId: string,
    dispatchBusLineId: string
  ): Promise<ApiResponse<null>> => {
    const res = await apiClient.post("/route-exits-repair/replace-driver", null, {
      params: { driverId, dispatchBusLineId },
    })
    return res.data
  },  

  finishRepair: async (
    id: string,
    data: { andDate: string; andTime: string; mileage: number; isExist: boolean }
  ): Promise<ApiResponse<string>> => {
    const res = await apiClient.put(`/route-exits-repair/finish-repair/${id}`, data)
    return res.data
  },  

  getBusRepairStats: async (
    busId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<BusRepairStatsResponse>> => {
    const res = await apiClient.get("/route-exits-repair/bus-history-with-stats", {
      params: { busId, startDate, endDate }
    })
    return res.data
  },

  filter: async (params: {
    startDate: string
    endDate: string
    depotId: string
    convoyId?: string
    repairTypes: string
  }): Promise<ApiResponse<RouteExitRepairDto[]>> => {
    try {
      const response = await apiClient.get("/route-exits-repair/filter", {
        params: {
          StartDate: params.startDate,
          EndDate: params.endDate,
          DepotId: params.depotId,
          ...(params.convoyId && { ConvoyId: params.convoyId }),
          RepairTypes: params.repairTypes,
        },
      })
      return response.data // ✅ ключевая правка
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error?.response?.data?.message || "Ошибка при получении данных",
        value: null,
        statusCode: 500,
      }
    }
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

  updateStatus: async (repairId: string, status: RouteExitRepairStatus): Promise<ApiResponse<null>> => {
    const res = await apiClient.put(`/route-exits-repair/status`, null, {
      params: { repairId, status }
    })
    return res.data
  },
  
  setStartTime: async (repairId: string, startTime: string): Promise<ApiResponse<null>> => {
    const res = await apiClient.put(`/route-exits-repair/repair/start-time`, { repairId, startTime })
    return res.data
  },
  
  setEndTime: async (repairId: string, endDate: string, endTime: string): Promise<ApiResponse<null>> => {
    const res = await apiClient.put(`/route-exits-repair/repair/end-time`, { repairId, endDate, endTime })
    return res.data
  },
  
}
