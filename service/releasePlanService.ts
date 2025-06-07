// releasePlanService.ts

import apiClient from "@/app/api/apiClient"
import type { RouteDispatchDetails } from "@/types/schedule.types"
import type { ApiResponse } from "@/types/api.types"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"
import type {
  DateDto,
  DispatchRouteCreateRequest,
  DispatchRouteUpdateRequest,
  ReserveAssignmentDto,
  ReserveAssignment,
  DispatchBusLineDto,
  BusLineAssignmentRequest,
  DayPlan,
  FinalDispatchData,
  ReserveReplacementCandidate
} from "@/types/releasePlanTypes"


const statusEnumMap: Record<DispatchBusLineStatus, string> = {
  [DispatchBusLineStatus.Undefined]: "Undefined",
  [DispatchBusLineStatus.Released]: "Released",
  [DispatchBusLineStatus.Replaced]: "Replaced",
  [DispatchBusLineStatus.Permutation]: "Permutation",
  [DispatchBusLineStatus.Removed]: "Removed",
}


export const releasePlanService = {
  createDispatchRoute: async (
    convoyId: string,
    date: string
  ): Promise<ApiResponse<string>> => {
    const payload = { convoyId, date }
    try {
      const { data } = await apiClient.post("/dispatches/route", payload)
      return data
    } catch (error: any) {
      console.error("❌ Ошибка при создании разнарядки:", error)
      throw new Error(error.response?.data?.error || "Не удалось создать разнарядку")
    }
  },
  

  replaceAssignment: async (
    dispatchBusLineId: string,
    isFirstShift: boolean,
    replacementType: string,
    newDriverId: string,
    newBusId: string
  ): Promise<ApiResponse<boolean>> => {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  
    // Основной запрос на замену
    const { data } = await apiClient.put(
      `/dispatches/replace/${dispatchBusLineId}/${isFirstShift}/${replacementType}`,
      null,
      {
        params: {
          newDriverId,
          newBusId,
        },
      }
    );
  
    // Если замена прошла успешно — добавим пометку "Снят с маршрута"
    if (data?.isSuccess) {
      try {
        await apiClient.put(`/dispatches/update-description`, {
          dispatchBusLineId,
          date,
          description: "Снят с маршрута",
        });
      } catch (err) {
        console.warn("⚠️ Ошибка при добавлении описания:", err);
      }
    }
  
    return data;
  },
  

  assignReserve: async (
    date: string,
    assignments: { driverId: string | null; busId: string | null; description: string | null }[],
    convoyId: string
  ): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.post(
      `/dispatches/reserve/${date}/assignments/${convoyId}`,
      assignments
    )
    return response.data
  },
  

  updateDispatchRoute: async (
    payload: DispatchRouteUpdateRequest
  ): Promise<ApiResponse<string>> => {
    const { data } = await apiClient.put(`/dispatches/route`, payload)
    return data
  },

  saveReserveAssignments: (date: string, assignments: { driverId: string | null; busId: string | null }[]) =>
    apiClient.post(`/dispatches/reserve/${date}/assignments`, assignments),
  
  
  getRouteDetails: async (
    routeId: string,
    date: string
  ): Promise<ApiResponse<RouteDispatchDetails>> => {
    try {
      const response = await apiClient.get<ApiResponse<RouteDispatchDetails>>(
        `/dispatches/route/${routeId}/date/${date}`
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`🔍 Разнарядка не найдена по маршруту ${routeId} на дату ${date}`)
        return {
          isSuccess: false,
          statusCode: 404,
          error: "Not Found",
          value: null,
        }
      }

      console.error("❌ Ошибка при получении разнарядки:", error)
      throw new Error(error.response?.data?.error || "Не удалось получить разнарядку")
    }
  },

  assignToReserve: async (
    date: string,
    payload: ReserveAssignmentDto[],
    convoyId: string
  ): Promise<ApiResponse<boolean>> => {
    const { data } = await apiClient.post(
      `/dispatches/reserve/${date}/assignments?convoyId=${convoyId}`,
      payload
    )
    return data
  },

  removeFromReserve: async (ids: string[]): Promise<ApiResponse<boolean>> => {
    const { data } = await apiClient.delete(`/dispatches/reserve/assignments`, { data: ids })
    return data
  },

  assignToBusLine: async (
    date: string,
    payload: DispatchBusLineDto
  ): Promise<ApiResponse<boolean>> => {
    const { data } = await apiClient.post(`/dispatches/${date}/assign-to-busline`, payload)
    return data
  },

  getFreeDrivers: async (
    date: string,
    convoyId: string,
    busId: string | null
  ) => {
    const response = await apiClient.get(`/drivers/free-drivers`, {
      params: {
        date,
        convoyId,
        ...(busId !== null && { busId }), // добавляем busId только если он не null
      },
    })
    return response.data
  },

  updateBusLineAssignment: async (
    date: string,
    payload: BusLineAssignmentRequest
  ): Promise<ApiResponse<boolean>> => {
    const { data } = await apiClient.put(`/dispatches/${date}/busline-assignment`, payload)
    return data
  },

  getReserveAssignmentsByDate: async (
    date: string,
    convoyId: string
  ): Promise<ApiResponse<ReserveAssignment[]>> => {
    const { data } = await apiClient.get(
      `/dispatches/reserve/${date}/all/${convoyId}`
    )
    return data
  },  
  
  getReserveReplacementsByDate: async (
    date: string,
    convoyId: string
  ): Promise<ApiResponse<ReserveReplacementCandidate[]>> => {
    const { data } = await apiClient.get(
      `/dispatches/reserve/${date}/all/${convoyId}`
    )
    return data
  },  
  
  updateReserveAssignment: async (
    id: string,
    payload: {
      driverId: string | null
      busId: string | null
      description?: string | null
    }
  ): Promise<ApiResponse<boolean>> => {
    const { data } = await apiClient.put(`/dispatches/reserve/${id}/assignment`, payload)
    return data
  },
  
  updateBusLineDescription: async (
    dispatchBusLineId: string,
    date: string,
    description: string
  ): Promise<ApiResponse<boolean>> => {
    const payload = {
      dispatchBusLineId,
      date,         // строка в формате "2025-05-21"
      description,
    };
  
    const { data } = await apiClient.put(`/dispatches/update-description`, payload);
    return data;
  },  

  getReservesByDate: async (date: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.get(`/dispatches/reserve/${date}/all`)
    return data
  },

  updateDispatchStatus(dispatchId: string, status: DispatchBusLineStatus, isRealsed: boolean) {
    const statusString = statusEnumMap[status];
    return apiClient.put(`/dispatches/update-status/${dispatchId}/${statusString}`, null, {
      params: { isRealsed },
    });
  },  
  
  async updateSolarium(dispatchBusLineId: string, solarium: string) {
    return apiClient.put(`/dispatches/update-solarium/${dispatchBusLineId}`, null, {
      params: { solarium },
    })
  },  

  getFullDispatchByDate: async (
    date: string,
    convoyId: string,
    routeStatus?: string,
    search?: string
  ): Promise<ApiResponse<FinalDispatchData>> => {
    const params: Record<string, string> = {}
  
    if (routeStatus) params.routStatus = routeStatus
    if (search) params.search = search
  
    const res = await apiClient.get(`/dispatches/${date}/full/${convoyId}`, {
      params
    })
  
    return res.data
  }  
} as const

