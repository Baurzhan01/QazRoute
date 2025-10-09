// service/actionLogService.ts

import apiClient from "@/app/api/apiClient";
import { ActionLog, ActionLogPayload } from "@/types/actionLog.types";
import { ApiResponse } from "@/types/api.types";

export const actionLogService = {
  /**
   * Добавить новое действие (ActionLog).
   * POST /api/actionlogs
   */
  create: async (payload: ActionLogPayload): Promise<ApiResponse<ActionLog>> => {
    const { data } = await apiClient.post("/actionlogs", payload);
    return data;
  },

  /**
   * Обновить действие (ActionLog).
   * PUT /api/actionlogs/{id}
   */
  update: async (
    id: string,
    payload: ActionLogPayload
  ): Promise<ApiResponse<ActionLog>> => {
    const { data } = await apiClient.put(`/actionlogs/${id}`, payload);
    return data;
  },

  /**
   * Удалить действие (ActionLog).
   * DELETE /api/actionlogs/{id}
   */
  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/actionlogs/${id}`);
    return data;
  },

  /**
   * Получить список действий по выходу (BusLine).
   * GET /api/actionlogs/bus-line/{busLineId}
   */
  getByBusLineId: async (busLineId: string): Promise<ApiResponse<ActionLog[]>> => {
    const { data } = await apiClient.get(`/actionlogs/bus-line/${busLineId}`);
    return data;
  },

  /**
   * Получить список действий по выходу в разнарядке (DispatchBusLine).
   * GET /api/actionlogs/by-dispatch-busline/{dispatchBusLineId}
   */
  getByDispatchBusLineId: async (
    dispatchBusLineId: string
  ): Promise<ApiResponse<ActionLog[]>> => {
    const { data } = await apiClient.get(
      `/actionlogs/by-dispatch-busline/${dispatchBusLineId}`
    );
    return data;
  },
} as const;