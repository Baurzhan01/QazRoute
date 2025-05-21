// services/revolutionService.ts

import apiClient from "@/app/api/apiClient"
import type {
  Revolution,
  CreateRevolutionRequest,
  UpdateRevolutionRequest,
  ApiResponse
} from "@/types/revolutions.types"

export const revolutionService = {
  getAll: async (): Promise<ApiResponse<Revolution[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Revolution[]>>("/revolutions")
      return response.data
    } catch (error: any) {
      console.error("❌ Ошибка при получении всех революций:", error)
      throw new Error(error.response?.data?.error || "Не удалось загрузить данные")
    }
  },

  getById: async (id: string): Promise<ApiResponse<Revolution>> => {
    try {
      const response = await apiClient.get<ApiResponse<Revolution>>(`/revolutions/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`❌ Ошибка при получении революции по id ${id}:`, error)
      throw new Error(error.response?.data?.error || "Не удалось загрузить запись")
    }
  },

  create: async (data: CreateRevolutionRequest): Promise<ApiResponse<Revolution>> => {
    try {
      const response = await apiClient.post<ApiResponse<Revolution>>("/revolutions", data)
      return response.data
    } catch (error: any) {
      console.error("❌ Ошибка при создании революции:", error)
      throw new Error(error.response?.data?.error || "Не удалось создать запись")
    }
  },

  update: async (id: string, data: UpdateRevolutionRequest): Promise<ApiResponse<Revolution>> => {
    try {
      const response = await apiClient.put<ApiResponse<Revolution>>(`/revolutions/${id}`, data)
      return response.data
    } catch (error: any) {
      console.error(`❌ Ошибка при обновлении революции ${id}:`, error)
      throw new Error(error.response?.data?.error || "Не удалось обновить запись")
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/revolutions/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`❌ Ошибка при удалении революции ${id}:`, error)
      throw new Error(error.response?.data?.error || "Не удалось удалить запись")
    }
  }
}
