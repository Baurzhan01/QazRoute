// service/telegramService.ts

import apiClient from "@/app/api/apiClient"
import type { ApiResponse } from "@/types/api.types"

export const telegramService = {
  /**
   * Разослать разнарядку водителям через Telegram-бота
   * @param date — дата в формате "yyyy-MM-dd"
   * @param convoyId — ID автоколонны
   */
  sendDispatchToDrivers: async (
    date: string,
    convoyId: string
  ): Promise<ApiResponse<boolean>> => {
    const { data } = await apiClient.post(
      `/telegram/send-by-dispatch`,
      null, // тело не нужно
      {
        params: { date, convoyId },
      }
    )
    return data
  },
}
