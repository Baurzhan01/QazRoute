// services/busService.ts
import apiClient from '../app/api/apiClient';
import type { ApiResponse, Bus, CreateBusRequest, UpdateBusRequest } from '../types/bus.types';

export const busService = {
  getAll: async (): Promise<ApiResponse<Bus[]>> => {
    const response = await apiClient.get<ApiResponse<Bus[]>>('/buses');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Bus>> => {
    const response = await apiClient.get<ApiResponse<Bus>>(`/buses/${id}`);
    return response.data;
  },

  getByConvoyId: async (convoyId: string): Promise<ApiResponse<Bus[]>> => {
    const response = await apiClient.get<ApiResponse<Bus[]>>(`/buses/convoy/${convoyId}`);
    return response.data;
  },

  create: async (data: CreateBusRequest): Promise<ApiResponse<Bus>> => {
    const response = await apiClient.post<ApiResponse<Bus>>('/buses', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBusRequest): Promise<ApiResponse<Bus>> => {
    const response = await apiClient.put<ApiResponse<Bus>>(`/buses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/buses/${id}`);
    return response.data;
  },
};