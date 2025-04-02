// services/driverService.ts
import apiClient from '../app/api/apiClient';
import type { ApiResponse, Driver, CreateDriverRequest, UpdateDriverRequest } from '../types/driver.types';

export const driverService = {
  getAll: async (): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>('/drivers');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.get<ApiResponse<Driver>>(`/drivers/${id}`);
    return response.data;    
  },

  getByDepotId: async (depotId: string): Promise<ApiResponse<Driver[]>> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>(`/drivers/by-depot/${depotId}`);
    return response.data;
  },

  getByBusId: async (busId: string): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.get<ApiResponse<Driver>>(`/drivers/by-bus/${busId}`);
    return response.data;
  },

  create: async (data: CreateDriverRequest): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.post<ApiResponse<Driver>>('/drivers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDriverRequest): Promise<ApiResponse<Driver>> => {
    const response = await apiClient.put<ApiResponse<Driver>>(`/drivers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/drivers/${id}`);
    return response.data;
  },
};