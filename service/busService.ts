import apiClient from "@/app/api/apiClient";
import type {
  Bus,
  BusWithDrivers,
  DisplayBus,
  PaginatedBusesResponse,
  ApiResponse,
  DepotBusWithAssignment,
  BusDepotPagedResponse
} from "@/types/bus.types";

export type GetByDepotExtra = {
  govNumber?: string;
  garageNumber?: string;
};

export const busService = {
  getAll: async (): Promise<ApiResponse<Bus[]>> => {
    const response = await apiClient.get("/buses");
    return response.data;
  },

  async getByDepot(
    depotId: string,
    page: string = "1",
    pageSize: string = "25",
    extra?: GetByDepotExtra
  ): Promise<BusDepotPagedResponse> {
    const params: Record<string, string> = {
      Page: page,
      PageSize: pageSize,
    };
    if (extra?.govNumber?.trim()) params.GovNumber = extra.govNumber.trim();
    if (extra?.garageNumber?.trim()) params.GarageNumber = extra.garageNumber.trim();

    const res = await apiClient.get(`/buses/by-depot/${depotId}`, { params });
    return res.data;
  },

  // Удобный хелпер: сам решает, какой параметр подставить
  async searchByDepot(
    depotId: string,
    query: string,
    page: string = "1",
    pageSize: string = "25"
  ): Promise<BusDepotPagedResponse> {
    const q = query.trim();
    const onlyDigits = /^\d+$/.test(q);
    const params: Record<string, string> = {
      Page: page,
      PageSize: pageSize,
    };
    if (q) {
      if (onlyDigits) params.GarageNumber = q; // «гаражный» чаще цифры
      else params.GovNumber = q;               // госномер обычно смешанный (буквы+цифры)
    }
    const res = await apiClient.get(`/buses/by-depot/${depotId}`, { params });
    return res.data;
  },

  getByConvoy: async (convoyId: string): Promise<DisplayBus[]> => {
    const response = await apiClient.get<ApiResponse<DisplayBus[]>>(`/buses/convoy/${convoyId}`);
    return response.data.value ?? [];
  },

  getById: async (id: string): Promise<ApiResponse<Bus>> => {
    const response = await apiClient.get(`/buses/${id}`);
    return response.data;
  },

  getWithDrivers: async (id: string): Promise<ApiResponse<BusWithDrivers>> => {
    const response = await apiClient.get(`/buses/with-drivers/${id}`);
    return response.data;
  },
  getByDepotWithAssignments: async (
    depotId: string,
    date: string
  ): Promise<ApiResponse<DepotBusWithAssignment[]>> => {
    const response = await apiClient.get(`/buses/by-depot/${depotId}/${date}`)
    return response.data
  },  

  getFreeBuses: async (date: string, convoyId: string): Promise<DisplayBus[]> => {
    const response = await apiClient.get<ApiResponse<DisplayBus[]>>(`/buses/free-buses`, {
      params: { date, convoyId }
    });
    return response.data.value ?? [];
  },

  getStatusStats: async (convoyId: string): Promise<ApiResponse<Record<string, number>>> => {
    const response = await apiClient.get(`/buses/bus-status-stats/${convoyId}`);
    return response.data;
  },

  create: async (data: Omit<Bus, "id"> & { driverIds: string[] }): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>("/buses", data);
    return response.data.value!;
  },

  update: async (id: string, data: Omit<Bus, "id">): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(`/buses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/buses/${id}`);
    return response.data;
  },

  assignDrivers: async (busId: string, driverIds: string[]): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/buses/${busId}/assign-drivers`, { driverIds });
    return response.data;
  },

  removeDriver: async (busId: string, driverId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/buses/${busId}/remove-driver/${driverId}`);
    return response.data;
  },

  getWeekendBuses: async (
    date: string,
    convoyId: string
  ): Promise<ApiResponse<DisplayBus[]>> => {
    const response = await apiClient.get<ApiResponse<DisplayBus[]>>(`/buses/weekend-buses`, {
      params: { date, convoyId },
    })
    return response.data
  },
  

  filter: async (params: {
    convoyId: string;
    page: number;
    pageSize: number;
    busStatus?: string | null;
    govNumber?: string | null;
    garageNumber?: string | null;
  }): Promise<PaginatedBusesResponse> => {
    const response = await apiClient.post<ApiResponse<PaginatedBusesResponse>>("/buses/filter", params);
    return response.data.value!;
  }
};
