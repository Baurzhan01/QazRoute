// services/authService.ts
import apiClient from '../app/api/apiClient'
import type { ApiResponse, AuthRequest, RegisterRequest, LoginResponse, UpdateUserRequest } from '../types/auth.types'

const setAuthData = (data: LoginResponse) => {
  if (!data.token) return

  localStorage.setItem('authToken', data.token)
  const normalizedRole = data.role?.charAt(0).toLowerCase() + data.role.slice(1)
  localStorage.setItem('userRole', normalizedRole || '')
  localStorage.setItem('busDepotId', data.busDepotId ?? '')
  localStorage.setItem('convoyNumber', data.convoyNumber ?? '')
  localStorage.setItem('authData', JSON.stringify(data))
}

export const authService = {
  login: async (data: AuthRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data)
    if (response.data.isSuccess && response.data.value) {
      setAuthData(response.data.value)
    }
    return response.data
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/register', data)
    return response.data
  },

  logout: (): void => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('busDepotId')
    localStorage.removeItem('convoyNumber')
    localStorage.removeItem('authData')
  },

  getByDepotId: async (busDepotId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>('/auth/bus-depotId', {
      params: { busDepotId },
    })
    return response.data
  },

  banUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>(`/auth/ban/${userId}`)
    return response.data
  },
  
  changePassword: async (
    userId: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>(
      `/auth/password/${userId}`,
      { newPassword }
    )
    return response.data
  },

  deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/auth/${userId}`)
    return response.data
  },

  updateUser: async (userId: string, data: UpdateUserRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>(`/auth/${userId}`, data)
    return response.data
  },
}
