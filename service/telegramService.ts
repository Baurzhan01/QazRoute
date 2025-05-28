// service/telegramService.ts

import apiClient from "@/app/api/apiClient"
import type { ApiResponse } from "@/types/api.types"

export const telegramService = {
  async sendDispatchToDrivers(date: string, convoyId: string): Promise<ApiResponse<number>> {
    try {
      const response = await apiClient.post<ApiResponse<number>>(
        "/telegram/send-by-dispatch",
        null,
        { params: { date, convoyId } }
      )
      return response.data
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error?.response?.data?.message || "Ошибка при отправке Telegram-сообщений",
        statusCode: error?.response?.status || 500,
        value: null,
      }
    }
  },
}