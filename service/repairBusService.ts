// src/service/repairBusService.ts

import apiClient from "@/app/api/apiClient";
import type {
    ApiResponse,
    Repair,
    CreateRepairRequest,
    UpdateRepairRequest,
    CreateRepairBatchRequest,
  } from "@/types/repairBus.types";
  

export const repairBusService = {
  /** Создать ремонт */
  async create(payload: CreateRepairRequest): Promise<ApiResponse<Repair>> {
    const res = await apiClient.post("/repairs", payload);
    return res.data;
  },

  /** Получить все ремонты */
  async getAll(): Promise<ApiResponse<Repair[]>> {
    const res = await apiClient.get("/repairs");
    return res.data;
  },

  /** Получить ремонт по ID */
  async getById(id: string): Promise<ApiResponse<Repair>> {
    const res = await apiClient.get(`/repairs/${id}`);
    return res.data;
  },
  /** Новый метод — batch-создание записей за одну дату */
  createBatch: async (payload: CreateRepairBatchRequest): Promise<ApiResponse<Repair[]>> => {
  const res = await apiClient.post(`/repairs/batch`, payload);
  return res.data;
  },

  /** Обновить ремонт */
  async update(id: string, payload: UpdateRepairRequest): Promise<ApiResponse<Repair>> {
    const res = await apiClient.put(`/repairs/${id}`, payload);
    return res.data;
  },

  /** Удалить ремонт */
  async remove(id: string): Promise<ApiResponse<null>> {
    const res = await apiClient.delete(`/repairs/${id}`);
    return res.data;
  },

  /** Получить ремонты по автобусу */
  async getByBusId(busId: string): Promise<ApiResponse<Repair[]>> {
    const res = await apiClient.get(`/repairs/by-bus/${busId}`);
    return res.data;
  },

  /** Получить ремонты по автобусному парку (депо) */
  async getByDepotId(depotId: string): Promise<ApiResponse<Repair[]>> {
    const res = await apiClient.get(`/repairs/by-depot/${depotId}`);
    return res.data;
  },
};
