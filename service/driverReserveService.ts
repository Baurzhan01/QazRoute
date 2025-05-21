// services/driverReserveService.ts
import apiClient from "@/app/api/apiClient"
import type { ApiResponse, Driver, DisplayDriver } from "@/types/driver.types"

export const driverReserveService = {
  // Получить всех водителей в резерве (устаревшее или общее)
  getAll: async (): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>("/reserve")
    return response.data
  },

  // Добавить водителя в резерв (возвращает void)
  addToReserve: async (driverId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/reserve/${driverId}`)
    return response.data
  },

  // Удалить водителя из резерва
  removeFromReserve: async (driverId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/reserve/${driverId}`)
    return response.data
  },

  // Получить список резервов по дате с деталями
  getReservesByDate: async (date: string): Promise<ApiResponse<DisplayDriver[]>> => {
    const response = await apiClient.get<ApiResponse<DisplayDriver[]>>(
      `/dispatches/reserve/${date}/all`
    )
    return response.data
  },

  // Назначить в резерв (массово)
  assignToReserve: async (
    date: string,
    assignments: { driverId?: string; busId?: string }[]
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/dispatches/reserve/${date}/assignments`,
      assignments
    )
    return response.data
  },

  // Удалить из резерва (массово)
  removeFromReserveByDate: async (
    date: string,
    items: { driverId?: string; busId?: string }[]
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.request<ApiResponse<void>>({
      method: "DELETE",
      url: `/dispatches/reserve/${date}/assignments`,
      data: items,
    })
    return response.data
  },
}
