// services/driverService.ts
import apiClient from "@/app/api/apiClient"
import type {
  Driver,
  ApiResponse,
  CreateDriverRequest,
  UpdateDriverRequest,
  DriverFilterRequest,
  PaginatedDriversResponse,
  DriverStatusCount,
  DisplayDriver,
  DriverStatus, // ← добавили
  DepotDriverWithAssignment, // ← переносим импорт сюда, можно из того же файла типов
} from "@/types/driver.types"
import type { TimesheetDayStatus } from "@/lib/utils/timesheet"

// 👇 Этот тип локальный для истории работы — оставляем здесь (или перенеси в общий types при желании)
export type DriverWorkHistoryStatus = DriverStatus | TimesheetDayStatus | string

export interface DriverWorkHistoryItem {
  date: string // "YYYY-MM-DD"
  routeAndExit: string | null // например "4/16"
  status: DriverWorkHistoryStatus
}

export const driverService = {
  getAll: async (): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>("/drivers")
    return response.data
  },

  // 🔹 История работы водителя за период
  getWorkHistory: async (
    driverId: string,
    startDate: string,
    days: number
  ): Promise<ApiResponse<DriverWorkHistoryItem[]>> => {
    const response = await apiClient.get<ApiResponse<DriverWorkHistoryItem[]>>(
      `/drivers/work-history/${driverId}`,
      { params: { startDate, days } }
    )
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.get<ApiResponse<Driver>>(`/drivers/${id}`)
    return response.data
  },

  getByBusId: async (busId: string): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>(`/drivers/by-bus/${busId}`)
    return response.data
  },

  getByDepotId: async (depotId: string): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>(`/drivers/by-depot/${depotId}`)
    return response.data
  },

  getByDepotWithAssignments: async (
    depotId: string,
    date: string
  ): Promise<ApiResponse<DepotDriverWithAssignment[]>> => {
    const response = await apiClient.get<ApiResponse<DepotDriverWithAssignment[]>>(
      `/drivers/by-depot/${depotId}/${date}`
    )
    return response.data
  },

  // 🔹 Ручная установка статуса дня (перекрывает авто-логику)
  setDailyStatus: async (
    driverId: string,
    date: string, // YYYY-MM-DD
    status: DriverStatus // "OnWork" | "DayOff" | ...
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/drivers/${driverId}/daily-status`,
      { date, status }
    )
    return response.data
  },
  /** Переместить водителя в другую автоколонну */
  replaceConvoy: async (driverId: string, convoyId: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.put<ApiResponse<void>>("/drivers/replace", null, {
      params: { driverId, convoyId },
    })
    return res.data
  },

  filter: async (
    filter: DriverFilterRequest
  ): Promise<ApiResponse<PaginatedDriversResponse>> => {
    const response = await apiClient.post<ApiResponse<PaginatedDriversResponse>>(
      "/drivers/filter",
      filter
    )
    return response.data
  },

  searchDrivers: async (depotId: string, query: string): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>("/drivers/search", {
      params: { depotId, query },
    })
    return response.data
  },

  getWeekendDrivers: async (
    date: string,
    convoyId: string
  ): Promise<ApiResponse<DisplayDriver[]>> => {
    const response = await apiClient.get<ApiResponse<DisplayDriver[]>>(`/drivers/weekend-drivers`, {
      params: { date, convoyId },
    })
    return response.data
  },

  create: async (data: CreateDriverRequest): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.post<ApiResponse<Driver>>("/drivers", data)
    return response.data
  },

  update: async (id: string, data: UpdateDriverRequest): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.put<ApiResponse<Driver>>(`/drivers/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/drivers/${id}`)
    return response.data
  },

  getFreeDrivers: async (
    date: string,
    convoyId: string,
    busId?: string
  ): Promise<ApiResponse<DisplayDriver[]>> => {
    const response = await apiClient.get<ApiResponse<DisplayDriver[]>>(`/drivers/free-drivers`, {
      params: { date, convoyId, busId },
    })
    return response.data
  },

  getStatusStats: async (
    convoyId: string
  ): Promise<ApiResponse<Omit<DriverStatusCount, "total">>> => {
    const response = await apiClient.get<ApiResponse<Omit<DriverStatusCount, "total">>>(
      `/drivers/status-stats/${convoyId}`
    )
    return response.data
  },
}

