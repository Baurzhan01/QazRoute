import apiClient from "@/app/api/apiClient"
import type { ApiResponse } from "@/types/common.types"
import type {
  CreateOrderDto,
  UpdateOrderDto,
  Order,
} from "@/types/order.types"

export const orderService = {
  // Получить все заказы
  getAll: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get<ApiResponse<Order[]>>("/orders")
    return response.data
  },

  // Получить заказы по автобусному парку
  getByDepotId: async (depotId: string): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get<ApiResponse<Order[]>>(
      `/orders/by-depot/${depotId}`
    )
    return response.data
  },

  // Получить заказ по ID
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data
  },

  // Создать заказ
  create: async (data: CreateOrderDto): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>("/orders", data)
    return response.data
  },

  // Обновить заказ
  update: async (
    id: string,
    data: UpdateOrderDto
  ): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.put<ApiResponse<boolean>>(
      `/orders/${id}`,
      data
    )
    return response.data
  },

  // Удалить заказ
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      `/orders/${id}`
    )
    return response.data
  },
}
