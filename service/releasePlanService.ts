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
  ReserveReplacementCandidate,
  AssignUnplannedDispatchResponse,
  AssignmentReplacement,
  DispatchReplacementHistoryDto,
  FullStatementData
} from "@/types/releasePlanTypes"
import { toHHmmss } from "@/app/dashboard/fleet-manager/release-plan/utils/timeUtils"


export const statusEnumMap: Record<DispatchBusLineStatus, string> = {
  [DispatchBusLineStatus.Undefined]: "Undefined",
  [DispatchBusLineStatus.Released]: "Released",
  [DispatchBusLineStatus.Replaced]: "Replaced",
  [DispatchBusLineStatus.Permutation]: "Permutation",
  [DispatchBusLineStatus.Removed]: "Removed",
  [DispatchBusLineStatus.RearrangingRoute]: "RearrangingRoute",
  [DispatchBusLineStatus.RearrangementRenovation]: "RearrangementRenovation",
  [DispatchBusLineStatus.Oder]: "Oder", // ✅ если на сервере именно так, оставить
  [DispatchBusLineStatus.LaunchedFromGarage]: "LaunchedFromGarage",

}


export const releasePlanService = {
  createDispatchRoute: async (
    convoyId: string,
    date: string,
    status: string // ← новый параметр
  ): Promise<ApiResponse<string>> => {
    const payload = { convoyId, date, status }
    try {
      const { data } = await apiClient.post("/dispatches/route", payload)
      return data
    } catch (error: any) {
      console.error("❌ Ошибка при создании разнарядки:", error)
      throw new Error(error.response?.data?.error || "Не удалось создать разнарядку")
    }
  },  
  markOrderAsReleased: async (orderId: string, time: string | null): Promise<void> => {
    const url = `/dispatches/order/start/${orderId}`
    await apiClient.put(url, null, {
      params: {
        time: time ?? null
      }
    })
  },  

  replaceAssignment: async (
    dispatchBusLineId: string,
    isFirstShift: boolean,
    replacementType: string,
    newDriverId: string,
    newBusId: string,
    isSwap: boolean = false,
    revolutionCount?: number, // <== 1. Added new parameter
    actionStatus?: string     // <== 2. Added new parameter
  ): Promise<ApiResponse<boolean>> => {
    const date = new Date().toISOString().split("T")[0];

    // 3. Dynamically build the params object
    const params: any = {
      newDriverId,
      newBusId,
      isSwap,
    };

    if (revolutionCount !== undefined && revolutionCount !== null) {
      params.RevolutionCount = revolutionCount;
    }
    if (actionStatus) {
      params.ActionStatus = actionStatus;
    }

    const { data } = await apiClient.put(
      `/dispatches/replace/${dispatchBusLineId}/${isFirstShift}/${replacementType}`,
      null,
      { params } // <== 4. Use the new params object
    );

    // This part of the logic might need adjustment later.
    // For now, it remains as is.
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

  getExtendedAssignmentsByDepot: async (
    date: string,
    depotId: string,
    routeStatus?: string
  ): Promise<ApiResponse<AssignmentReplacement[]>> => {
    const response = await apiClient.get(
      `/dispatches/duta/extended/by-depot/${depotId}/${date}`,
      { params: routeStatus ? { routeStatus } : undefined }
    );
    return response.data;
  },  

  assignReserve: async (
    date: string,
    assignments: { driverId: string | null; busId: string | null; description: string | null }[],
    convoyId: string,
    status?: string  // ← добавлено
  ): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.post(
      `/dispatches/reserve/${date}/assignments/${convoyId}`,
      assignments,
      {
        params: status ? { status } : undefined,  // ← условно добавляется статус
      }
    )
    return response.data
  },
  

  updateDispatchRoute: async (
    payload: DispatchRouteUpdateRequest
  ): Promise<ApiResponse<string>> => {
    const normalized = {
      dispatchRouteId: payload.dispatchRouteId,
      busLines: payload.busLines.map(b => ({
        id: b.id,
        busId: b.busId,
        driver1Id: b.driver1Id,
        driver2Id: b.driver2Id,
        departureTime: toHHmmss(b.departureTime)!, // → "HH:mm:ss"
        endTime: toHHmmss(b.endTime)!,
        ...(b.scheduleStart != null && { scheduleStart: toHHmmss(b.scheduleStart)! }),
        ...(b.scheduleShiftChange != null && { scheduleShiftChange: toHHmmss(b.scheduleShiftChange)! }),
      })),
    }
  
    const { data } = await apiClient.put(`/dispatches/route`, normalized)
    return data
  },

  updateReserveDescription: async (reserveId: string, date: string, description: string) => {
    const body = {
      reserveId,
      date,
      description
    }
  
    return apiClient.put("/dispatches/update-description/reserve", body)
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

  getDispatchHistory: async (dispatchBusLineId: string): Promise<ApiResponse<DispatchReplacementHistoryDto[]>> => {
    const res = await apiClient.get(`/dispatches/history/${dispatchBusLineId}`);
    return res.data;
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
    convoyId: string,
    status?: string  // ← добавлено
  ): Promise<ApiResponse<ReserveAssignment[]>> => {
    const response = await apiClient.get(
      `/dispatches/reserve/${date}/all/${convoyId}`,
      {
        params: status ? { status } : undefined,  // ← условно добавляется статус
      }
    )
    return response.data
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

  getFullStatementByDate: async (
    date: string,
    convoyId: string,
    routeStatus?: string,
    search?: string
  ): Promise<ApiResponse<FullStatementData>> => {
    const params: Record<string, string> = {}
    if (routeStatus) params.routStatus = routeStatus // на сервере именно так
    if (search) params.search = search
  
    const res = await apiClient.get(`/dispatches/${date}/full/statement/${convoyId}`, { params })
    return res.data
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

