import apiClient from "@/app/api/apiClient"
import type {
  ApiResponse,
  Route,
  CreateRouteRequest,
  UpdateRouteRequest,
  RouteConflict,
  RouteStatus
} from "@/types/route.types"

export const routeService = {
  // Получить все маршруты
  getAll: async (): Promise<ApiResponse<Route[]>> => {
    const res = await apiClient.get<ApiResponse<Route[]>>("/routes")
    return res.data
  },

  // Получить маршруты по колонне с опциональным фильтром по статусу
  getByConvoyId: async (convoyId: string, status?: string): Promise<ApiResponse<Route[]>> => {
    const res = await apiClient.get<ApiResponse<Route[]>>(`/routes/by-convoy/${convoyId}`, {
      params: status ? { status } : {},
    })
    return res.data
  },

   // НОВОЕ: все маршруты с их выходами, с фильтром по типу дня
   getAllWithLines: async (type?: RouteStatus): Promise<ApiResponse<Route[]>> => {
    const res = await apiClient.get<ApiResponse<Route[]>>("/routes/all", {
      params: type ? { type } : {},
    })
    return res.data
  },

  // Получить маршрут по ID
  getById: async (id: string): Promise<ApiResponse<Route>> => {
    const res = await apiClient.get<ApiResponse<Route>>(`/routes/${id}`)
    return res.data
  },

  // Создать маршрут
  create: async (data: CreateRouteRequest): Promise<ApiResponse<string>> => {
    const res = await apiClient.post<ApiResponse<string>>("/routes", data)
    return res.data
  },

  // Обновить маршрут
  update: async (id: string, data: UpdateRouteRequest): Promise<ApiResponse<Route>> => {
    const res = await apiClient.put<ApiResponse<Route>>(`/routes/${id}`, data)
    return res.data
  },

  // Удалить маршрут
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/routes/${id}`)
    return res.data
  },

  // Проверка на дубликаты маршрута по номеру и колонне
  checkRoute: async (number: string, convoyId: string, routeStatus: string): Promise<ApiResponse<RouteConflict[]>> => {
    const res = await apiClient.get<ApiResponse<RouteConflict[]>>("/routes/check", {
      params: { number, convoyId, routeStatus },
    })
    return res.data
  },

  // Проверка очереди (уникальности)
  checkRouteQueue: async (convoyId: string, queue: number): Promise<ApiResponse<void>> => {
    const res = await apiClient.get<ApiResponse<void>>("/routes/check-queue", {
      params: { convoyId, queue },
    })
    return res.data
  },
}
