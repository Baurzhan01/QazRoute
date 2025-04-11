import apiClient from "@/app/api/apiClient"
import type { Bus, BusWithDrivers } from "@/types/bus.types"
import type { PaginatedBusesResponse } from "@/types/bus.types"

export const busService = {
  // Получить все автобусы (общий список, редко используется)
  getAll: async () => (await apiClient.get("/buses")).data,

  getByConvoy: async (convoyId: string) => {
    const res = await apiClient.get(`/buses/convoy/${convoyId}`)
    return res.data?.value ?? []
  },

  // Получить автобус по ID
  getById: async (id: string) =>
    (await apiClient.get(`/buses/${id}`)).data,

  // Получить автобус с назначенными водителями
  getWithDrivers: async (id: string) =>
    (await apiClient.get(`/buses/with-drivers/${id}`)).data,

  // Получить статистику по статусам
  getStatusStats: async (convoyId: string) =>
    (await apiClient.get(`/buses/bus-status-stats/${convoyId}`)).data,

  // Создать автобус с привязкой водителей
  create: async (bus: Omit<Bus, "id"> & { driverIds: string[] }): Promise<string> => {
    const res = await apiClient.post("/buses", bus)
    return res.data.value // <-- это строка ID
  },
  // Обновить автобус
  update: async (id: string, bus: Omit<Bus, "id">) =>
    (await apiClient.put(`/buses/${id}`, bus)).data,

  // Удалить автобус
  delete: async (id: string) =>
    (await apiClient.delete(`/buses/${id}`)).data,

  // Назначить водителей автобусу
  assignDrivers: async (id: string, driverIds: string[]) =>
    (await apiClient.post(`/buses/${id}/assign-drivers`, { driverIds })).data,

  // Удалить водителя с автобуса
  removeDriver: async (busId: string, driverId: string) =>
    (await apiClient.delete(`/buses/${busId}/remove-driver/${driverId}`)).data,

  // Фильтрация автобусов с пагинацией
  // busService.ts

filter: async (params: {
  convoyId: string
  status?: string | null
  search?: string
  page: number
  pageSize: number
}): Promise<PaginatedBusesResponse> => {
  const res = await apiClient.post("/buses/filter", params)
  return res.data.value
}
}
