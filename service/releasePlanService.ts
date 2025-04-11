import type { ApiResponse } from "../types"
import type {
  CalendarMonth,
  DayPlan,
  RouteDetails,
  FinalDispatch,
  BusAssignment,
  ReserveAssignment,
  AvailableBus,
  AvailableDriver,
} from "./releasePlanTypes"

const API_BASE_URL = "https://localhost:7250/api"

// Вспомогательная функция для обработки ответов API
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Ошибка HTTP: ${response.status}`)
  }

  return (await response.json()) as ApiResponse<T>
}

// Вспомогательная функция для выполнения запросов
async function fetchApi<T>(
  endpoint: string,
  method = "GET",
  body?: any,
  headers: HeadersInit = {},
): Promise<ApiResponse<T>> {
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  }

  const token = localStorage.getItem("authToken")
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include",
  }

  if (body && method !== "GET") {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse<T>(response)
}

// API сервис для работы с планом выпуска
export const releasePlanService = {
  // Получение данных календаря для месяца
  getCalendarMonth: async (year: number, month: number): Promise<ApiResponse<CalendarMonth>> => {
    return fetchApi<CalendarMonth>(`/release-plan/calendar/${year}/${month}`)
  },

  // Получение плана на конкретный день
  getDayPlan: async (date: string): Promise<ApiResponse<DayPlan>> => {
    return fetchApi<DayPlan>(`/release-plan/day/${date}`)
  },

  // Получение деталей маршрута на конкретный день
  getRouteDetails: async (routeId: string, date: string): Promise<ApiResponse<RouteDetails>> => {
    return fetchApi<RouteDetails>(`/release-plan/route/${routeId}/date/${date}`)
  },

  // Получение итоговой разнарядки на день
  getFinalDispatch: async (date: string): Promise<ApiResponse<FinalDispatch>> => {
    return fetchApi<FinalDispatch>(`/release-plan/final-dispatch/${date}`)
  },

  // Сохранение назначений на маршрут
  saveRouteAssignments: async (
    routeId: string,
    date: string,
    assignments: BusAssignment[],
  ): Promise<ApiResponse<boolean>> => {
    return fetchApi<boolean>(`/release-plan/route/${routeId}/date/${date}/assignments`, "POST", assignments)
  },

  // Сохранение назначений в резерв
  saveReserveAssignments: async (date: string, assignments: ReserveAssignment[]): Promise<ApiResponse<boolean>> => {
    return fetchApi<boolean>(`/release-plan/reserve/${date}/assignments`, "POST", assignments)
  },

  // Получение списка доступных автобусов на дату
  getAvailableBuses: async (date: string): Promise<ApiResponse<AvailableBus[]>> => {
    return fetchApi<AvailableBus[]>(`/release-plan/available-buses/${date}`)
  },

  // Получение списка доступных водителей на дату
  getAvailableDrivers: async (date: string): Promise<ApiResponse<AvailableDriver[]>> => {
    return fetchApi<AvailableDriver[]>(`/release-plan/available-drivers/${date}`)
  },

  // Подтверждение итоговой разнарядки
  confirmFinalDispatch: async (date: string): Promise<ApiResponse<boolean>> => {
    return fetchApi<boolean>(`/release-plan/final-dispatch/${date}/confirm`, "POST")
  },

  // Экспорт итоговой разнарядки в PDF
  exportFinalDispatchToPdf: async (date: string): Promise<Blob> => {
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
    }

    const token = localStorage.getItem("authToken")
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/release-plan/final-dispatch/${date}/export-pdf`, {
      method: "GET",
      headers: requestHeaders,
      credentials: "include",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Ошибка HTTP: ${response.status}`)
    }

    return await response.blob()
  },

  // Получение праздничных дней на год
  getHolidays: async (year: number): Promise<ApiResponse<{ date: string; name: string }[]>> => {
    return fetchApi<{ date: string; name: string }[]>(`/release-plan/holidays/${year}`)
  },

  // Добавление/редактирование праздничного дня
  saveHoliday: async (date: string, name: string): Promise<ApiResponse<boolean>> => {
    return fetchApi<boolean>(`/release-plan/holidays`, "POST", { date, name })
  },

  // Удаление праздничного дня
  deleteHoliday: async (date: string): Promise<ApiResponse<boolean>> => {
    return fetchApi<boolean>(`/release-plan/holidays/${date}`, "DELETE")
  },
}

