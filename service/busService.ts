import apiClient from "@/app/api/apiClient";
import type { Bus, BusWithDrivers, DisplayBus, PaginatedBusesResponse } from "@/types/bus.types";

export const busService = {
  // Получить все автобусы
  getAll: async () => (await apiClient.get("/buses")).data,

  // Получить автобусы по колонне
  getByConvoy: async (convoyId: string) => {
    const res = await apiClient.get(`/buses/convoy/${convoyId}`);
    return res.data?.value ?? [];
  },

  getFreeBuses: (date: string, convoyId: string) =>
    apiClient.get<{ isSuccess: boolean; value: DisplayBus[] }>(`/buses/free-buses`, {
      params: { date, convoyId },
    }).then((res) => res.data),
  

  // Получить автобус по ID
  getById: async (id: string) => (await apiClient.get(`/buses/${id}`)).data,

  // Получить автобус с назначенными водителями
  getWithDrivers: async (id: string) => (await apiClient.get(`/buses/with-drivers/${id}`)).data,

  // Получить статистику по статусам
  getStatusStats: async (convoyId: string) =>
    (await apiClient.get(`/buses/bus-status-stats/${convoyId}`)).data,

  // Создать автобус (с опциональными водителями)
  create: async (bus: Omit<Bus, "id"> & { driverIds: string[] }): Promise<string> => {
    const res = await apiClient.post("/buses", bus);
    return res.data.value; // возвращаем ID нового автобуса
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

  // 🚍 Фильтрация автобусов с пагинацией
  filter: async (params: {
    convoyId: string;
    page: number;
    pageSize: number;
    busStatus?: string | null;
    govNumber?: string | null;
    garageNumber?: string | null;
  }): Promise<PaginatedBusesResponse> => {
    const res = await apiClient.post("/buses/filter", params);
    return res.data.value;
  },
};
