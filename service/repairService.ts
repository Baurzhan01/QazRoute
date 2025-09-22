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

  filter: async (params: {
    StartDate: string;
    EndDate: string;
    BusId?: string;
    BusGovNumber?: string;
    BusGarageNumber?: string;
    Page?: number;
    PageSize?: number;
  }): Promise<ApiResponse<RepairDto[]>> => {
    try {
      const res = await apiClient.get("/repair/filter", { params });
      return res.data;
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error?.response?.data?.message || "Ошибка при получении ремонтов",
        value: null,
        statusCode: 500,
      };
    }
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
    repairId: string,
    data: RepairInputDto
  ): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.put(`/repair/${repairId}`, data);
    return res.data;
  },  

  deleteRepairById: async (date: string, repairId: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.delete(`/repair/${date}/assignments/${repairId}`);
    return res.data;
  },  
};
