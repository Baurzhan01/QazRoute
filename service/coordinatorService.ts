import apiClient from "@/app/api/apiClient"
import type { ApiResponse } from "@/types/api.types"
import type {
  DispatchTable,
  ConvoyCoordinatorSummary,
  ConvoyCoordinatorCard,
  UserWorkShift,
  WorkShiftDay,
  WorkShiftType,
} from "@/types/coordinator.types"

export const coordinatorService = {
  getConvoysByDepot: async (busDepotId: string, date: string): Promise<ApiResponse<ConvoyCoordinatorCard[]>> => {
    const response = await apiClient.get<ApiResponse<ConvoyCoordinatorCard[]>>(
      `/coordinator/convoys`,
      { params: { busDepotId, date } }
    )
    return response.data
  },

  getConvoySummary: async (convoyId: string, date: string): Promise<ApiResponse<ConvoyCoordinatorSummary>> => {
    const response = await apiClient.get<ApiResponse<ConvoyCoordinatorSummary>>(
      `/coordinator/convoy-summary`,
      { params: { convoyId, date } }
    )
    return response.data
  },

  getDispatchTable: async (convoyId: string, date: string): Promise<ApiResponse<DispatchTable>> => {
    const response = await apiClient.get<ApiResponse<DispatchTable>>(
      `/coordinator/dispatch-table`,
      { params: { convoyId, date } }
    )
    return response.data
  },

  updateBusLineStatus: async (dispatchBusLineId: string, status: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>(
      `/coordinator/dispatch-bus-lines/${dispatchBusLineId}/status`,
      null,
      { params: { status } }
    )
    return response.data
  },

  getWorkShiftsByDepot: async (
    depotId: string,
    year: number,
    month: number
  ): Promise<ApiResponse<UserWorkShift[]>> => {
    const response = await apiClient.get<ApiResponse<UserWorkShift[]>>(
      `/coordinator/work-shift/by-depot`,
      { params: { depotId, year, month } }
    )
    return response.data
  },

  generateMonthlyWorkShift: async (
    depotId: string,
    year: number,
    month: number
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/api/coordinator/work-shift/generate-monthly`,
      null,
      { params: { depotId, year, month } }
    )
    return response.data
  },

  updateUserShift: async (
    userId: string,
    date: string,
    shiftType: WorkShiftType
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>(
      `/api/coordinator/work-shift/update-shift`,
      null,
      { params: { userId, date, shiftType } }
    )
    return response.data
  },

  getShiftTable: async (depotId: string, year: number, month: number): Promise<ApiResponse<UserWorkShift[]>> => {
    const response = await apiClient.get(`/api/coordinator/work-shift/by-depot`, {
      params: { depotId, year, month },
    })
    return response.data
  },
  
  updateShift: async (userId: string, date: string, shiftType: WorkShiftType): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(`/api/coordinator/work-shift/update-shift`, null, {
      params: { userId, date, shiftType },
    })
    return response.data
  },  

  // 🔸 Новый метод: получить смены конкретного пользователя
  getUserShiftsByMonth: async (
    userId: string,
    depotId: string,
    year: number,
    month: number
  ): Promise<ApiResponse<WorkShiftDay[]>> => {
    const res = await apiClient.get<ApiResponse<UserWorkShift[]>>(
      `/api/coordinator/work-shift/by-depot`,
      { params: { depotId, year, month } }
    )

    if (!res.data.isSuccess || !res.data.value) {
      return {
        isSuccess: false,
        statusCode: res.data.statusCode || 500,
        error: res.data.error || "Ошибка при получении смен",
        value: [],
      }
    }

    const user = res.data.value.find((u) => u.userId === userId)

    return {
      isSuccess: true,
      statusCode: 200,
      error: null,
      value: user?.days ?? [],
    }
  },
}
