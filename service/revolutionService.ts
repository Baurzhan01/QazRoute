// services/revolutionService.ts
import apiClient from '../app/api/apiClient';
import type { ApiResponse, Revolution, CreateRevolutionRequest, UpdateRevolutionRequest } from '../types/revolutions.types';

export const revolutionService = {
  getAll: async (): Promise<ApiResponse<Revolution[]>> => {
    const response = await apiClient.get<ApiResponse<Revolution[]>>('/revolutions');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Revolution>> => {
    const response = await apiClient.get<ApiResponse<Revolution>>(`/revolutions/${id}`);
    return response.data;
  },

  create: async (data: CreateRevolutionRequest): Promise<ApiResponse<Revolution>> => {
    const response = await apiClient.post<ApiResponse<Revolution>>('/revolutions', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRevolutionRequest): Promise<ApiResponse<Revolution>> => {
    const response = await apiClient.put<ApiResponse<Revolution>>(`/revolutions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/revolutions/${id}`);
    return response.data;
  },
};