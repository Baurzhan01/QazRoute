import type {
  ApiResponse,
  Bus,
  BusDepot,
  Convoy,
  Driver,
  Route,
  Schedule,
  Revolution,
  AuthRequest,
  RegisterRequest,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7250/api"

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

// Аутентификация
export const authService = {
  login: async (credentials: AuthRequest): Promise<any> => {
    const response = await fetchApi<any>("/auth/login", "POST", credentials)
    if (response.isSuccess && response.value?.token) {
      localStorage.setItem("authToken", response.value.token)
    }
    return response
  },

  register: async (userData: RegisterRequest): Promise<any> => {
    return fetchApi<any>("/auth/register", "POST", userData)
  },

  logout: (): void => {
    localStorage.removeItem("authToken")
  },
}

// Автобусы
export const busService = {
  getAll: async (): Promise<ApiResponse<Bus[]>> => {
    return fetchApi<Bus[]>("/buses")
  },

  getById: async (id: string): Promise<ApiResponse<Bus>> => {
    return fetchApi<Bus>(`/buses/${id}`)
  },

  create: async (bus: Omit<Bus, "id">): Promise<ApiResponse<Bus>> => {
    return fetchApi<Bus>("/buses", "POST", bus)
  },

  update: async (id: string, bus: Omit<Bus, "id">): Promise<ApiResponse<Bus>> => {
    return fetchApi<Bus>(`/buses/${id}`, "PUT", bus)
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/buses/${id}`, "DELETE")
  },
}

// Автобусные парки
export const busDepotService = {
  getAll: async (): Promise<ApiResponse<BusDepot[]>> => {
    return fetchApi<BusDepot[]>("/bus-depots")
  },

  getById: async (id: string): Promise<ApiResponse<BusDepot>> => {
    return fetchApi<BusDepot>(`/bus-depots/${id}`)
  },

  create: async (depot: Omit<BusDepot, "id">): Promise<ApiResponse<BusDepot>> => {
    return fetchApi<BusDepot>("/bus-depots", "POST", depot)
  },

  update: async (id: string, depot: Omit<BusDepot, "id">): Promise<ApiResponse<BusDepot>> => {
    return fetchApi<BusDepot>(`/bus-depots/${id}`, "PUT", depot)
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/bus-depots/${id}`, "DELETE")
  },
}

// Автоколонны
export const convoyService = {
  getAll: async (): Promise<ApiResponse<Convoy[]>> => {
    return fetchApi<Convoy[]>("/convoys")
  },

  getById: async (id: string): Promise<ApiResponse<Convoy>> => {
    return fetchApi<Convoy>(`/convoys/${id}`)
  },

  create: async (convoy: Omit<Convoy, "id" | "busIds">): Promise<ApiResponse<Convoy>> => {
    return fetchApi<Convoy>("/convoys", "POST", convoy)
  },

  update: async (id: string, convoy: Omit<Convoy, "id" | "busIds">): Promise<ApiResponse<Convoy>> => {
    return fetchApi<Convoy>(`/convoys/${id}`, "PUT", convoy)
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/convoys/${id}`, "DELETE")
  },
}

// Водители
export const driverService = {
  getAll: async (): Promise<ApiResponse<Driver[]>> => {
    return fetchApi<Driver[]>("/drivers")
  },

  getById: async (id: string): Promise<ApiResponse<Driver>> => {
    return fetchApi<Driver>(`/drivers/${id}`)
  },

  create: async (driver: Omit<Driver, "id">): Promise<ApiResponse<Driver>> => {
    return fetchApi<Driver>("/drivers", "POST", driver)
  },

  update: async (id: string, driver: Omit<Driver, "id">): Promise<ApiResponse<Driver>> => {
    return fetchApi<Driver>(`/drivers/${id}`, "PUT", driver)
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/drivers/${id}`, "DELETE")
  },

  // Резерв водителей
  getReserve: async (): Promise<ApiResponse<Driver[]>> => {
    return fetchApi<Driver[]>("/reserve")
  },

  addToReserve: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/reserve/${id}`, "POST")
  },

  removeFromReserve: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/reserve/${id}`, "DELETE")
  },
}

// Маршруты
export const routeService = {
  getAll: async (): Promise<ApiResponse<Route[]>> => {
    return fetchApi<Route[]>("/routes")
  },

  getById: async (id: string): Promise<ApiResponse<Route>> => {
    return fetchApi<Route>(`/routes/${id}`)
  },

  create: async (route: Omit<Route, "id">): Promise<ApiResponse<Route>> => {
    return fetchApi<Route>("/routes", "POST", route)
  },

  update: async (id: string, route: Omit<Route, "id">): Promise<ApiResponse<Route>> => {
    return fetchApi<Route>(`/routes/${id}`, "PUT", route)
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/routes/${id}`, "DELETE")
  },
}

// Расписания
export const scheduleService = {
  getAll: async (): Promise<ApiResponse<Schedule[]>> => {
    return fetchApi<Schedule[]>("/schedules")
  },

  getById: async (id: string): Promise<ApiResponse<Schedule>> => {
    return fetchApi<Schedule>(`/schedules/${id}`)
  },

  create: async (schedule: Omit<Schedule, "id">): Promise<ApiResponse<Schedule>> => {
    return fetchApi<Schedule>("/schedules", "POST", schedule)
  },

  update: async (id: string, schedule: Omit<Schedule, "id">): Promise<ApiResponse<Schedule>> => {
    return fetchApi<Schedule>(`/schedules/${id}`, "PUT", schedule)
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/schedules/${id}`, "DELETE")
  },
}

// Рейсы
export const revolutionService = {
  getAll: async (): Promise<ApiResponse<Revolution[]>> => {
    return fetchApi<Revolution[]>("/revolutions")
  },

  getById: async (id: string): Promise<ApiResponse<Revolution>> => {
    return fetchApi<Revolution>(`/revolutions/${id}`)
  },

  create: async (revolution: Omit<Revolution, "id">): Promise<ApiResponse<Revolution>> => {
    return fetchApi<Revolution>("/revolutions", "POST", revolution)
  },

  update: async (id: string, revolution: Omit<Revolution, "id">): Promise<ApiResponse<Revolution>> => {
    return fetchApi<Revolution>(`/revolutions/${id}`, "PUT", revolution)
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/revolutions/${id}`, "DELETE")
  },
}

// Определения интерфейсов для аналитики
interface FleetStats {
  totalBuses: number
  activeRoutes: number
  drivers: number
  maintenanceBuses: number
}

interface FleetStatus {
  operational: number
  inMaintenance: number
  outOfService: number
}

// Аналитика автопарка (для дашборда)
export const analyticsService = {
  getFleetStats: async (): Promise<FleetStats> => {
    try {
      const [buses, routes, drivers] = await Promise.all([
        busService.getAll(),
        routeService.getAll(),
        driverService.getAll(),
      ])

      // Подсчет автобусов на ТО
      const maintenanceBuses = buses.value?.filter((bus) => bus.busStatus === "Maintenance").length || 0

      return {
        totalBuses: buses.value?.length || 0,
        activeRoutes: routes.value?.length || 0,
        drivers: drivers.value?.length || 0,
        maintenanceBuses,
      }
    } catch (error) {
      console.error("Ошибка при получении статистики автопарка:", error)
      throw error
    }
  },

  getFleetStatus: async (): Promise<FleetStatus> => {
    try {
      const buses = await busService.getAll()

      if (!buses.value || buses.value.length === 0) {
        return { operational: 0, inMaintenance: 0, outOfService: 0 }
      }

      const total = buses.value.length
      const operational = buses.value.filter((bus) => bus.busStatus === "Operational").length
      const inMaintenance = buses.value.filter((bus) => bus.busStatus === "Maintenance").length
      const outOfService = buses.value.filter((bus) => bus.busStatus === "OutOfService").length

      return {
        operational: Math.round((operational / total) * 100),
        inMaintenance: Math.round((inMaintenance / total) * 100),
        outOfService: Math.round((outOfService / total) * 100),
      }
    } catch (error) {
      console.error("Ошибка при получении статуса автопарка:", error)
      throw error
    }
  },
}

