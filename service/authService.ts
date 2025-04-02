// services/authService.ts
import apiClient from '../app/api/apiClient';
import type { ApiResponse, AuthRequest, RegisterRequest, LoginResponse } from '../types/auth.types';

export const authService = {
  login: async (data: AuthRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    if (response.data.isSuccess && response.data.value?.token) {
      localStorage.setItem('authToken', response.data.value.token);
      if (response.data.value.role) {
        response.data.value.role = response.data.value.role.charAt(0).toLowerCase() + response.data.value.role.slice(1);
      }
      localStorage.setItem('userRole', response.data.value.role);
      localStorage.setItem('busDepotId', response.data.value.busDepotId);
      localStorage.setItem('convoyNumber', response.data.value.convoyNumber);
      localStorage.setItem('authData', JSON.stringify(response.data.value));
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/register', data);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  },
};