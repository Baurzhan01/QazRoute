import apiClient from '../app/api/apiClient';
import type { ApiResponse, BusLine, CreateBusLineRequest, UpdateBusLineRequest } from '../types/busLine.types';

export const busLineService = {
  getAll: async (): Promise<ApiResponse<BusLine[]>> => {
    const response = await apiClient.get<ApiResponse<BusLine[]>>(`/bus-lines`);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<BusLine>> => {
    const response = await apiClient.get<ApiResponse<BusLine>>(`/bus-lines/${id}`);
    return response.data;
  },

  getByRouteId: async (routeId: string): Promise<ApiResponse<BusLine[]>> => {
    const response = await apiClient.get<ApiResponse<BusLine[]>>(`/bus-lines/by-route/${routeId}`);
    return response.data;
  },

  create: async (data: CreateBusLineRequest): Promise<ApiResponse<BusLine>> => {
    try {
      const response = await apiClient.post<ApiResponse<BusLine>>('/bus-lines', data);
      return response.data;
    } catch (error: any) {
      const errorDetails = error.response
        ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          }
        : { message: error.message };
      console.error("Ошибка при создании выхода:", errorDetails);
      throw new Error(`Не удалось создать выход: ${JSON.stringify(errorDetails)}`);
    }
  },

  createMultiple: async (data: { routeId: string; busLines: CreateBusLineRequest[] }): Promise<ApiResponse<BusLine[]>> => {
    try {
      const response = await apiClient.post<ApiResponse<BusLine[]>>('/bus-lines/bulk', data);
      return response.data;
    } catch (error: any) {
      const errorDetails = error.response
        ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          }
        : { message: error.message };
      console.error("Ошибка при создании выходов:", errorDetails);
      throw new Error(`Не удалось создать выходы: ${JSON.stringify(errorDetails)}`);
    }
  },

  update: async (id: string, data: UpdateBusLineRequest): Promise<ApiResponse<BusLine>> => {
    const response = await apiClient.put<ApiResponse<BusLine>>(`/bus-lines/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/bus-lines/${id}`);
    return response.data;
  },
};