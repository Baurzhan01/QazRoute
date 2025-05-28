// service/telegramService.ts

import apiClient from "@/app/api/apiClient"

export const telegramService = {
  async sendDispatchToDrivers(date: string, convoyId: string): Promise<string> {
    try {
      const response = await apiClient.post<string>(
        "/telegram/send-by-dispatch",
        null,
        { params: { date, convoyId } }
      )
      return response.data // просто строка!
    } catch (error: any) {
      const message =
        error?.response?.data || error?.response?.data?.message || "Ошибка при отправке Telegram-сообщений"
      throw new Error(message)
    }
  },
}
