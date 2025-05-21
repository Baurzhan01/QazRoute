import apiClient from "@/app/api/apiClient"
import type { ApiResponse } from "@/types/common.types"
import type { OrderBus, AddOrderBusDto } from "@/types/orderBus.types"

export const orderBusService = {
  // Получить все автобусы по заказу
  getByOrderId: async (orderId: string): Promise<ApiResponse<OrderBus[]>> => {
    const response = await apiClient.get<ApiResponse<OrderBus[]>>(
      `/order-buses/${orderId}`
    )
    return response.data
  },

  // Получить автобусы заказа по колонне
  getByConvoyId: async (convoyId: string): Promise<ApiResponse<OrderBus[]>> => {
    const response = await apiClient.get<ApiResponse<OrderBus[]>>(
      `/order-buses/convoy/${convoyId}`
    )
    return response.data
  },

  // Добавить автобус в заказ
  create: async (data: AddOrderBusDto): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.post<ApiResponse<boolean>>(
      "/order-buses",
      data
    )
    return response.data
  },

  // Удалить автобус из заказа
  delete: async (orderBusId: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      `/order-buses/${orderBusId}`
    )
    return response.data
  },
}
