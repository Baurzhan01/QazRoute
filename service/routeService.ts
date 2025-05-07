// services/routeService.ts
import apiClient from '../app/api/apiClient';
import type { ApiResponse, Route, CreateRouteRequest, UpdateRouteRequest } from '../types/route.types';

export const routeService = {
  getAll: async (): Promise<ApiResponse<Route[]>> => {
    const response = await apiClient.get<ApiResponse<Route[]>>('/routes');
    return response.data;
  },

 // Новый: передаём опционально статус
 getByConvoyId: async (convoyId: string, status?: string): Promise<ApiResponse<Route[]>> => {
  const params = status ? { status } : {}; // 🔥 если статус undefined — передаём пустой объект
  const response = await apiClient.get<ApiResponse<Route[]>>(`/routes/by-convoy/${convoyId}`, { params });
  return response.data;
},


  getById: async (id: string): Promise<ApiResponse<Route>> => {
    const response = await apiClient.get<ApiResponse<Route>>(`/routes/${id}`);
    return response.data;
  },

  create: async (data: CreateRouteRequest): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>('/routes', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRouteRequest): Promise<ApiResponse<Route>> => {
    const response = await apiClient.put<ApiResponse<Route>>(`/routes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/routes/${id}`);
    return response.data;
  },

  checkRoute: async (number: string, convoyId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.get<ApiResponse<void>>('/routes/check', {
      params: { number, convoyId },
    });
    return response.data;
  },

  checkRouteQueue: async (convoyId: string, queue: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.get<ApiResponse<void>>('/routes/check-queue', {
      params: { convoyId, queue },
    });
    return response.data;
  },
};