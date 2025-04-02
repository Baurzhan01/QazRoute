// services/depotService.ts
import apiClient from '../app/api/apiClient';
import type { ApiResponse, BusDepot, CreateBusDepotRequest, UpdateBusDepotRequest } from '../types/depot.types';

export const busDepotService = {
  getAll: async (): Promise<ApiResponse<BusDepot[]>> => {
    const response = await apiClient.get<ApiResponse<BusDepot[]>>('/bus-depots');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<BusDepot>> => {
    const response = await apiClient.get<ApiResponse<BusDepot>>(`/bus-depots/${id}`);
    return response.data;
},

  create: async (data: CreateBusDepotRequest): Promise<ApiResponse<BusDepot>> => {
    const response = await apiClient.post<ApiResponse<BusDepot>>('/bus-depots', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBusDepotRequest): Promise<ApiResponse<BusDepot>> => {
    const response = await apiClient.put<ApiResponse<BusDepot>>(`/bus-depots/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/bus-depots/${id}`);
    return response.data;
  },
};