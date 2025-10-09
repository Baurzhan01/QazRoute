// statementsService.ts (ваш файл с сервисом)

import apiClient from "@/app/api/apiClient";
// Импортируем все нужные типы
import {
  Statement,
  UpdateStatementPayload,
} from "@/types/statement.types";
import { ApiResponse } from "@/types/api.types";

export const statementsService = {
  // POST /statements/generate/{dispatchId}
  generate: async (dispatchId: string) => {
    const { data } = await apiClient.post(`/statements/generate/${dispatchId}`);
    return data;
  },

  // GET /statements/{id}
  getById: async (id: string): Promise<ApiResponse<Statement>> => {
    const { data } = await apiClient.get(`/statements/${id}`);
    return data;
  },

  // GET /statements/{convoyId}/{date}
  getByConvoyAndDate: async (
    convoyId: string,
    date: string
  ): Promise<ApiResponse<Statement[]>> => {
    const { data } = await apiClient.get(`/statements/${convoyId}/${date}`);
    return data;
  },

  /**
   * Обновить данные ведомости.
   * PUT /statements/{id}
   */
  update: async (
    id: string,
    payload: UpdateStatementPayload
  ): Promise<ApiResponse<Statement>> => {
    const { data } = await apiClient.put(`/statements/${id}`, payload);
    return data;
  },

  /**
   * Удалить ведомость по ID.
   * DELETE /statements/{id}
   */
  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/statements/${id}`);
    return data; // Обычно возвращает ответ об успехе без тела
  },
} as const;