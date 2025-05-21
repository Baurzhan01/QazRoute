import apiClient from "@/app/api/apiClient";
import type { ApiResponse, BusLine, CreateBusLineRequest, UpdateBusLineRequest } from "@/types/busLine.types";

const dateToTicks = (date: Date): number => {
  const epochTicks = 621355968000000000;
  return epochTicks + date.getTime() * 10000;
};

export const busLineService = {
  getAll: async (): Promise<ApiResponse<BusLine[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<BusLine[]>>(`/bus-lines`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка при получении всех выходов:", error);
      throw new Error(error.response?.data?.error || "Не удалось загрузить выходы");
    }
  },

  getById: async (id: string): Promise<ApiResponse<BusLine>> => {
    try {
      const response = await apiClient.get<ApiResponse<BusLine>>(`/bus-lines/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Ошибка при получении выхода по id ${id}:`, error);
      throw new Error(error.response?.data?.error || "Не удалось загрузить выход");
    }
  },

  getByRouteId: async (routeId: string): Promise<ApiResponse<BusLine[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<BusLine[]>>(`/bus-lines/by-route/${routeId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`⚠️ Выходы для маршрута ${routeId} не найдены. Вернём пустой массив.`);
        return {
          isSuccess: true,
          error: null,
          statusCode: 200,
          value: [],
        };
      }
      console.error(`❌ Ошибка при получении выходов по маршруту ${routeId}:`, error);
      throw new Error(error.response?.data?.error || "Не удалось загрузить выходы");
    }
  },

  create: async (data: CreateBusLineRequest): Promise<ApiResponse<BusLine>> => {
    try {
      const response = await apiClient.post<ApiResponse<BusLine>>(`/bus-lines`, data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка при создании выхода:", error);
      throw new Error(error.response?.data?.error || "Не удалось создать выход");
    }
  },

  createMultiple: async (data: { routeId: string; busLines: CreateBusLineRequest[] }): Promise<ApiResponse<BusLine[]>> => {
    try {
      console.log("📦 Отправка массива выходов:", data);
      const response = await apiClient.post<ApiResponse<BusLine[]>>(`/bus-lines/bulk`, data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка при массовом создании выходов:", error);
      throw new Error(error.response?.data?.error || "Не удалось создать выходы");
    }
  },

  update: async (id: string, data: UpdateBusLineRequest): Promise<ApiResponse<BusLine>> => {
    try {
      const response = await apiClient.put<ApiResponse<BusLine>>(`/bus-lines/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Ошибка при обновлении выхода ${id}:`, error);
      throw new Error(error.response?.data?.error || "Не удалось обновить выход");
    }
  },
  updateExitTime: async (
    id: string,
    exitTime: Date | null,
    number: string,
    endTime?: Date | null,
    shiftChangeTime?: Date | null,
    routeId?: string
  ): Promise<ApiResponse<BusLine>> => {
    try {
      const formatTime = (date: Date | null | undefined): string | null =>
        date ? date.toISOString().substring(11, 16) : null;
  
      const response = await apiClient.put<ApiResponse<BusLine>>(`/bus-lines/${id}`, {
        number, // теперь передаём явно
        exitTime: formatTime(exitTime),
        endTime: formatTime(endTime),
        shiftChangeTime: formatTime(shiftChangeTime),
        routeId,
      });
  
      return response.data;
    } catch (error: any) {
      console.error(`❌ Ошибка при обновлении выхода ${id}:`, error);
      throw new Error(error.response?.data?.error || "Не удалось обновить выход");
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/bus-lines/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Ошибка при удалении выхода ${id}:`, error);
      throw new Error(error.response?.data?.error || "Не удалось удалить выход");
    }
  },
};
