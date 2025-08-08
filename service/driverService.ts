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
} from "@/types/driver.types"
import type { DepotDriverWithAssignment } from "@/types/driver.types"


export const driverService = {
  getAll: async (): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>("/drivers")
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
    const response = await apiClient.get(`/drivers/by-depot/${depotId}/${date}`)
    return response.data
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
  const response = await apiClient.get("/drivers/search", {
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
