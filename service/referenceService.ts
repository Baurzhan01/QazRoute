// service/referenceService.ts
import apiClient from "@/app/api/apiClient"
import type {
  ApiResponse,
  ReferenceDto,
  ReferenceCreateRequest,
  ReferenceUpdateRequest,
} from "@/types/reference.types"

export const referenceService = {
  // Создать справку
  create: async (data: ReferenceCreateRequest): Promise<ApiResponse<string>> => {
    const res = await apiClient.post<ApiResponse<string>>("/references", data)
    return res.data
  },

  // Получить все справки
  getAll: async (): Promise<ApiResponse<ReferenceDto[]>> => {
    const res = await apiClient.get<ApiResponse<ReferenceDto[]>>("/references")
    return res.data
  },

  // Получить справку по ID
  getById: async (id: string): Promise<ApiResponse<ReferenceDto>> => {
    const res = await apiClient.get<ApiResponse<ReferenceDto>>(`/references/${id}`)
    return res.data
  },

  // Обновить справку
  update: async (id: string, data: ReferenceUpdateRequest): Promise<ApiResponse<string>> => {
    const res = await apiClient.put<ApiResponse<string>>(`/references/${id}`, data)
    return res.data
  },

  // Удалить справку
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/references/${id}`)
    return res.data
  },

  // Получить все справки по конкретному DispatchBusLine
  getByDispatchBusLine: async (dispatchBusLineId: string): Promise<ApiResponse<ReferenceDto[]>> => {
    const res = await apiClient.get<ApiResponse<ReferenceDto[]>>(
      `/references/by-dispatch-busline/${dispatchBusLineId}`
    )
    return res.data
  },
}
