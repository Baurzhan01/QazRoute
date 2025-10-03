// service/repairBusService.ts
import apiClient from "@/app/api/apiClient";
import type { ApiResponse } from "@/types/api.types";
import type { Repair, CreateRepairRequest, PagedResult, RepairRegister, RepairRegisterDetail } from "@/types/repairBus.types";

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

  // Получить ремонты по автобусу (с пагинацией/фильтрацией)
  getByBusId: async (
    busId: string,
    params?: { page?: number; pageSize?: number; createdFrom?: string; createdTo?: string }
  ): Promise<ApiResponse<PagedResult<Repair>>> => {
    const res = await apiClient.get(`/repairs/by-bus/${busId}`, { params });
    return res.data;
  },

  // Получить список реестров ремонтов
  getRegisters: async (params: { page: number; pageSize: number }) => {
    const res = await apiClient.get(`/repairs/registers`, { params });
    return res.data as ApiResponse<PagedResult<RepairRegister> & {
      grandTotalWorkSum: number;
      grandTotalSpareSum: number;
      grandTotalAllSum: number;
    }>;
  },

// Получить ремонты по номеру реестра (с фильтрацией и пагинацией)
getByRegister: async (registerNumber: string, params?: any) => {
  const res = await apiClient.get(`/repairs/by-register/${registerNumber}`, { params });
  return res.data as ApiResponse<RepairRegisterDetail>;
},


  // Получить ремонты по автопарку (с фильтрацией/пагинацией)
  getByDepotId: async (
    depotId: string,
    params?: {
      busId?: string;
      busBrand?: string;
      garageNumber?: string;
      govNumber?: string;
      sparePartId?: string;
      sparePartName?: string;
      sparePartArticle?: string;
      laborTimeId?: string;
      workName?: string;
      workCode?: string;
      createdFrom?: string;
      createdTo?: string;
      departureFrom?: string;
      departureTo?: string;
      minAllSum?: number;
      maxAllSum?: number;
      page?: number;
      pageSize?: number;
    }
  ): Promise<ApiResponse<PagedResult<Repair>>> => {
    const res = await apiClient.get(`/repairs/by-depot/${depotId}`, { params });
    return res.data;
  },

  // Создать один ремонт
  create: async (payload: CreateRepairRequest): Promise<ApiResponse<Repair>> => {
    const res = await apiClient.post("/repairs", payload);
    return res.data;
  },

  // Создать несколько ремонтов
  createBatch: async (payload: CreateRepairRequest[]): Promise<ApiResponse<Repair[]>> => {
    const res = await apiClient.post("/repairs/batch", payload);
    return res.data;
  },

  // Обновить ремонт
  update: async (id: string, payload: CreateRepairRequest): Promise<ApiResponse<Repair>> => {
    const res = await apiClient.put(`/repairs/${id}`, payload);
    return res.data;
  },

  // Удалить ремонт
  remove: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.delete(`/repairs/${id}`);
    return res.data;
  },
  checkApplicationNumber: async (
    number: number
  ): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.get(`/repairs/check/number/${number}`);
    return res.data;
  },
};
