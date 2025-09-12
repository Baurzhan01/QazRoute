// service/sparePartsService.ts
import apiClient from "@/app/api/apiClient";
import type { ApiResponse } from "@/types/common.types"; // если есть общий тип
import type { SparePart, LaborTime } from "@/types/spareParts.types";

export const sparePartsService = {
  importSheet: async (file: File): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append("sheet", file);
    const res = await apiClient.post("/spare-parts/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  searchByArticle: async (article: string): Promise<ApiResponse<SparePart[]>> => {
    const res = await apiClient.get("/spare-parts/search", { params: { article } });
    return res.data;
  },

  searchLaborTime: async (article: string): Promise<ApiResponse<LaborTime[]>> => {
    const res = await apiClient.get("/spare-parts/labortime/search", { params: { article } });
    return res.data;
  },
};
