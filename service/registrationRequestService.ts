// services/registrationRequestService.ts
import apiClient from '../app/api/apiClient';
import type { ApiResponse, Driver } from '../types/driverReserve.types';

export const registrationRequestService = {
  getReserve: async (): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>('/reserve');
    return response.data;
  },

  addToReserve: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/reserve/${id}`);
    return response.data;
  },

  removeFromReserve: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/reserve/${id}`);
    return response.data;
  },
};