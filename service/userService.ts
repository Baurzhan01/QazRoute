// services/userService.ts
import apiClient from '../app/api/apiClient';
import type { ApiResponse, User, UpdateUserRequest } from '../types/user.types';

export const userService = {
  getUsersByDepot: async (depotId: string): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get<ApiResponse<User[]>>(`/auth/bus-depotId`, {
      params: { busDepotId: depotId },
    });
    return response.data;
  },

  updateUser: async (userId: string, data: UpdateUserRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>(`/auth/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/auth/${userId}`);
    return response.data;
  },
};