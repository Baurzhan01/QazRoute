import apiClient from "@/app/api/apiClient"
import type { Driver, ApiResponse, CreateDriverRequest, UpdateDriverRequest, DriverFilterRequest, PaginatedDriversResponse, DriverStatusCount, DisplayDriver } from "@/types/driver.types"

export const driverService = {
  // Получить всех водителей
  getAll: async (): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>("/drivers")
    return response.data
  },

  // Получить водителя по ID
  getById: async (id: string): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.get<ApiResponse<Driver>>(`/drivers/${id}`)
    return response.data
  },

  // Получить водителя по ID автобуса
  getByBusId: async (busId: string): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.get<ApiResponse<Driver>>(`/drivers/by-bus/${busId}`)
    return response.data
  },

  // Получить водителей по ID автобусного парка
  getByDepotId: async (depotId: string): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>(`/drivers/by-depot/${depotId}`)
    return response.data
  },

  // Фильтрация водителей (по депо, статусу, резерву и т.д.)
  filter: async (filter: DriverFilterRequest): Promise<ApiResponse<PaginatedDriversResponse>> => {
    const response = await apiClient.post<ApiResponse<PaginatedDriversResponse>>("/drivers/filter", filter)
    return response.data
  },

  // Создать водителя
  create: async (data: CreateDriverRequest): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.post<ApiResponse<Driver>>("/drivers", data)
    return response.data
  },

  // Обновить водителя
  update: async (id: string, data: UpdateDriverRequest): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.put<ApiResponse<Driver>>(`/drivers/${id}`, data)
    return response.data
  },
  getFreeDrivers: (date: string, convoyId: string) =>
    apiClient.get<{ isSuccess: boolean; value: DisplayDriver[] }>(`/drivers/free-drivers`, {
      params: { date, convoyId },
    }).then((res) => res.data),
  
  // Удалить водителя
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/drivers/${id}`)
    return response.data
  },
  getStatusStats: async (convoyId: string): Promise<ApiResponse<Omit<DriverStatusCount, "total">>> => {
    const response = await apiClient.get<ApiResponse<Omit<DriverStatusCount, "total">>>(
      `/drivers/status-stats/${convoyId}`
    )
    return response.data
  },
}
