import apiClient from "@/app/api/apiClient";
import type { ApiResponse } from "@/types/api.types";
import type { RepairDto, GroupedRepairsByConvoy } from "@/types/repair.types";

export interface RepairInputDto {
  driverId: string;
  busId: string;
  description: string;
}

export const repairService = {
  getRepairsByDate: async (
    date: string,
    convoyId: string
  ): Promise<ApiResponse<RepairDto[]>> => {
    const res = await apiClient.get(`/repair/${date}/all`, { params: { convoyId } });
    return res.data;
  },

  getRepairsByDepotAndDate: async (
    date: string,
    depotId: string
  ): Promise<ApiResponse<RepairDto[]>> => {
    const res = await apiClient.get(`/repair/${date}/all-by-depot`, {
      params: { depotId },
    });
    return res.data;
  },

  assignRepairs: async (
    date: string,
    convoyId: string,
    data: RepairInputDto[]
  ): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.post(`/repair/${date}/assignments`, data, { params: { convoyId } });
    return res.data;
  },

  updateRepair: async (
    date: string,
    convoyId: string,
    data: RepairInputDto
  ): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.put(`/repair/${date}/assignment`, data, { params: { convoyId } });
    return res.data;
  },

  deleteRepairs: async (
    date: string,
    data: RepairInputDto[]
  ): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.delete(`/repair/${date}/assignments`, { data });
    return res.data;
  },
};
