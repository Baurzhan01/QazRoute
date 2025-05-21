import apiClient from '../app/api/apiClient';
import type { ApiResponse, Convoy, CreateConvoyRequest, UpdateConvoyRequest } from '../types/convoy.types';

export const convoyService = {
    getAll: async (): Promise<ApiResponse<Convoy[]>> => {
      const response = await apiClient.get<ApiResponse<Convoy[]>>('/convoys');
      return response.data;
    },
  
    getByDepotId: async (depotId: string): Promise<ApiResponse<Convoy[]>> => {
      const response = await apiClient.get<ApiResponse<Convoy[]>>(`/convoys/by-depot/${depotId}`);
      return response.data;
    },

    getConvoySummary: async (
      convoyId: string,
      date: string
    ): Promise<ApiResponse<any>> => {
      const response = await apiClient.get(`/convoys/convoy-summary`, {
        params: { convoyId, date }
      });
      return response.data;
    },    
  
    getById: async (id: string): Promise<ApiResponse<Convoy>> => {
      const response = await apiClient.get<ApiResponse<Convoy>>(`/convoys/${id}`);
      return response.data;
    },
  
    create: async (data: CreateConvoyRequest): Promise<ApiResponse<string>> => {
      const response = await apiClient.post<ApiResponse<string>>('/convoys', data);
      return response.data;
    },
  
    update: async (id: string, data: UpdateConvoyRequest): Promise<ApiResponse<Convoy>> => {
      const response = await apiClient.put<ApiResponse<Convoy>>(`/convoys/${id}`, data);
      return response.data;
    },
  
    delete: async (id: string): Promise<ApiResponse<void>> => {
      const response = await apiClient.delete<ApiResponse<void>>(`/convoys/${id}`);
      return response.data;
    },
  };