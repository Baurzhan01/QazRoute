// service/busAggregateService.ts
import apiClient from "@/app/api/apiClient";
import type { ApiResponse } from "@/types/api.types";
import type {
  BusAggregate,
  BusAggregateListResponse,
  BusAggregateResponse,
  CreateBusAggregateRequest,
  UpdateBusAggregateRequest,
} from "@/types/busAggregate.types";

const BASE_URL = "/bus-aggregates";

export const busAggregateService = {
  create: async (payload: CreateBusAggregateRequest): Promise<BusAggregateResponse> => {
    const res = await apiClient.post(BASE_URL, payload);
    return res.data;
  },

  getAll: async (params?: { page?: number; pageSize?: number; search?: string }): Promise<BusAggregateListResponse> => {
    const res = await apiClient.get(BASE_URL, { params });
    return res.data;
  },

  getById: async (id: string): Promise<BusAggregateResponse> => {
    const res = await apiClient.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  update: async (id: string, payload: UpdateBusAggregateRequest): Promise<BusAggregateResponse> => {
    const res = await apiClient.put(`${BASE_URL}/${id}`, payload);
    return res.data;
  },

  remove: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.delete(`${BASE_URL}/${id}`);
    return res.data;
  },

  getByBusId: async (busId: string): Promise<BusAggregateListResponse> => {
    const res = await apiClient.get(`${BASE_URL}/by-bus/${busId}`);
    return res.data;
  },
};
