import apiClient from "@/app/api/apiClient";
import type { ApiResponse } from "@/types/api.types";
import type { Repair, CreateRepairRequest } from "@/types/repairBus.types";

export const repairBusService = {
  // Получить все ремонты
  getAll: async (): Promise<ApiResponse<Repair[]>> => {
    const res = await apiClient.get("/repairs");
    return res.data;
  },

  // Получить ремонт по ID
  getById: async (id: string): Promise<ApiResponse<Repair>> => {
    const res = await apiClient.get(`/repairs/${id}`);
    return res.data;
  },

  // Получить ремонты по автобусу
  getByBusId: async (busId: string): Promise<ApiResponse<Repair[]>> => {
    const res = await apiClient.get(`/repairs/by-bus/${busId}`);
    return res.data;
  },

  // Получить ремонты по автобусному парку
  getByDepotId: async (depotId: string): Promise<ApiResponse<Repair[]>> => {
    const res = await apiClient.get(`/repairs/by-depot/${depotId}`);
    return res.data;
  },

  // Создать один ремонт
  create: async (payload: CreateRepairRequest): Promise<ApiResponse<Repair>> => {
    const res = await apiClient.post("/repairs", payload);
    return res.data;
  },

  // Создать несколько ремонтов
  createBatch: async (
    payload: CreateRepairRequest[]
  ): Promise<ApiResponse<Repair[]>> => {
    const res = await apiClient.post("/repairs/batch", payload);
    return res.data;
  },

  // Обновить ремонт
  update: async (
    id: string,
    payload: CreateRepairRequest
  ): Promise<ApiResponse<Repair>> => {
    const res = await apiClient.put(`/repairs/${id}`, payload);
    return res.data;
  },

  // Удалить ремонт
  remove: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.delete(`/repairs/${id}`);
    return res.data;
  },
};
