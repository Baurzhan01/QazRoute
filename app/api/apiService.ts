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
  User,
  FleetStats,
  FleetStatus,
  UpdateUserRequest,
  CreateDepotRequest,
} from "./types";

// Новая сущность BusLine
interface BusLine {
  id?: string;
  number: string;
  exitTime: string; // ISO формат
  endTime: string; // ISO формат
  shiftChangeTime: string; // ISO формат
  routeId: string;
}

//const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://82.115.49.203/api";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7250/api";

// Вспомогательная функция для обработки ответов API
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("Content-Type");
  const text = await response.text();

  console.log("👉 Ответ от сервера:", text);

  if (!response.ok) {
    let errorMessage = "Ошибка запроса";
    try {
      const json = JSON.parse(text);
      errorMessage = json.error || errorMessage;
    } catch {
      console.error("⚠ Некорректный JSON. Возможно, пришёл HTML.");
    }

    return {
      isSuccess: false,
      error: errorMessage,
      statusCode: response.status,
      value: null,
    };
  }

  if (!text) {
    return {
      isSuccess: true,
      error: undefined,
      statusCode: response.status,
      value: null,
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Ответ сервера не является JSON");
  }
}

// Вспомогательная функция для выполнения запросов
async function fetchApi<T>(
  endpoint: string,
  method = "GET",
  body?: any,
  headers: Record<string, string> = {},
): Promise<ApiResponse<T>> {
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const token = localStorage.getItem("authToken");
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  
  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include",
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse<T>(response);
}

// Аутентификация
export const authService = {
  login: async (credentials: AuthRequest): Promise<ApiResponse<{ token: string; role: string; fullName: string , convoyNumber: string, busDepotId: string }>> => {
    const response = await fetchApi<{ token: string; role: string; fullName: string , convoyNumber: string, busDepotId: string }>("/auth/login", "POST", credentials);
    if (response.isSuccess && response.value?.token) {
      localStorage.setItem("authToken", response.value.token);
      localStorage.setItem("convoyNumber", response.value.convoyNumber);
      localStorage.setItem("busDepotId", response.value.busDepotId);
      localStorage.setItem("authData", JSON.stringify(response.value));
      // Преобразуем роль из PascalCase в camelCase
      if (response.value.role) {
        response.value.role = response.value.role.charAt(0).toLowerCase() + response.value.role.slice(1);
      }
      localStorage.setItem("userRole", response.value.role); // Сохраняем роль в localStorage
    }
    return response;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<User>> => {
    return fetchApi<User>("/auth/register", "POST", userData);
  },

  logout: (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole"); // Удаляем роль при выходе
  },

  getUsersByDepotId: async (depotId: string): Promise<ApiResponse<User[]>> => {
    return fetchApi<User[]>(`/auth/bus-depotId?busDepotId=${depotId}`);
  },

  updateUser: async (id: string, userData: { fullName: string; role: string; convoyId?: string }): Promise<ApiResponse<User>> => {
    return fetchApi<User>(`/auth/${id}`, "PUT", userData);
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/auth/${id}`, "DELETE"); // Новый эндпоинт
  },
};

// Автобусы
export const busService = {
  getAll: async (): Promise<ApiResponse<Bus[]>> => {
    return fetchApi<Bus[]>("/buses");
  },

  getById: async (id: string): Promise<ApiResponse<Bus>> => {
    return fetchApi<Bus>(`/buses/${id}`);
  },

  getByConvoyId: async (convoyId: string): Promise<ApiResponse<Bus[]>> => {
    return fetchApi<Bus[]>(`/buses/convoy/${convoyId}`);
  },

  create: async (bus: Omit<Bus, "id">): Promise<ApiResponse<Bus>> => {
    return fetchApi<Bus>("/buses", "POST", bus);
  },

  update: async (id: string, bus: Omit<Bus, "id">): Promise<ApiResponse<Bus>> => {
    return fetchApi<Bus>(`/buses/${id}`, "PUT", bus);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/buses/${id}`, "DELETE");
  },
};

// Автобусные парки
export const busDepotService = {
  // Получить все автобусные парки
  getAll: async (): Promise<ApiResponse<BusDepot[]>> => {
    return fetchApi<BusDepot[]>("/bus-depots");
  },

  // Получить автобусный парк по ID
  getById: async (id: string): Promise<ApiResponse<BusDepot>> => {
    return fetchApi<BusDepot>(`/bus-depots/${id}`);
  },

  // Создать новый автобусный парк (CreateDepotRequest -> только name, city, address)
  create: async (depot: CreateDepotRequest): Promise<ApiResponse<BusDepot>> => {
    return fetchApi<BusDepot>("/bus-depots", "POST", depot);
  },

  // Обновить существующий автобусный парк (если нужно)
  update: async (id: string, depot: Omit<BusDepot, "id">): Promise<ApiResponse<BusDepot>> => {
    return fetchApi<BusDepot>(`/bus-depots/${id}`, "PUT", depot);
  },

  // Удалить автобусный парк
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/bus-depots/${id}`, "DELETE");
  },

  // Получить всех пользователей парка (если необходимо)
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    return fetchApi<User[]>("/users");
  },
};


// Автоколонны
export const convoyService = {
  getAll: async (): Promise<ApiResponse<Convoy[]>> => {
    return fetchApi<Convoy[]>("/convoys");
  },

  getByDepotId: async (depotId: string): Promise<ApiResponse<Convoy[]>> => {
    return fetchApi<Convoy[]>(`/convoys/by-depot/${depotId}`);
  },

  getById: async (id: string): Promise<ApiResponse<Convoy>> => {
    return fetchApi<Convoy>(`/convoys/${id}`);
  },

  create: async (convoy: Omit<Convoy, "id" | "busIds" | "chief" | "mechanic" | "buses" | "driversCount">): Promise<ApiResponse<string>> => {
    return fetchApi<string>("/convoys", "POST", convoy);
  },

  update: async (id: string, convoy: Omit<Convoy, "id" | "busIds" | "chief" | "mechanic" | "buses" | "driversCount">): Promise<ApiResponse<Convoy>> => {
    return fetchApi<Convoy>(`/convoys/${id}`, "PUT", convoy);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/convoys/${id}`, "DELETE");
  },
};

// Водители
export const driverService = {
  getAll: async (): Promise<ApiResponse<Driver[]>> => {
    return fetchApi<Driver[]>("/drivers");
  },

  getById: async (id: string): Promise<ApiResponse<Driver>> => {
    return fetchApi<Driver>(`/drivers/${id}`);
  },

  getByDepotId: async (depotId: string): Promise<ApiResponse<Driver[]>> => {
    return fetchApi<Driver[]>(`/drivers/by-depot/${depotId}`);
  },

  getByBusId: async (busId: string): Promise<ApiResponse<Driver>> => {
    return fetchApi<Driver>(`/drivers/by-bus/${busId}`);
  },

  create: async (driver: Omit<Driver, "id">): Promise<ApiResponse<Driver>> => {
    return fetchApi<Driver>("/drivers", "POST", driver);
  },

  update: async (id: string, driver: Omit<Driver, "id">): Promise<ApiResponse<Driver>> => {
    return fetchApi<Driver>(`/drivers/${id}`, "PUT", driver);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/drivers/${id}`, "DELETE");
  },

  // Резерв водителей
  getReserve: async (): Promise<ApiResponse<Driver[]>> => {
    return fetchApi<Driver[]>("/reserve");
  },

  addToReserve: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/reserve/${id}`, "POST");
  },

  removeFromReserve: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/reserve/${id}`, "DELETE");
  },
};

// Маршруты
export const routeService = {
  getAll: async (): Promise<ApiResponse<Route[]>> => {
    return fetchApi<Route[]>("/routes");
  },

  getById: async (id: string): Promise<ApiResponse<Route>> => {
    return fetchApi<Route>(`/routes/${id}`);
  },

  create: async (route: Omit<Route, "id">): Promise<ApiResponse<Route>> => {
    return fetchApi<Route>("/routes", "POST", route);
  },

  update: async (id: string, route: Omit<Route, "id">): Promise<ApiResponse<Route>> => {
    return fetchApi<Route>(`/routes/${id}`, "PUT", route);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/routes/${id}`, "DELETE");
  },
};

// Расписания
export const scheduleService = {
  getAll: async (): Promise<ApiResponse<Schedule[]>> => {
    return fetchApi<Schedule[]>("/schedules");
  },

  getById: async (id: string): Promise<ApiResponse<Schedule>> => {
    return fetchApi<Schedule>(`/schedules/${id}`);
  },

  create: async (schedule: Omit<Schedule, "id">): Promise<ApiResponse<Schedule>> => {
    return fetchApi<Schedule>("/schedules", "POST", schedule);
  },

  update: async (id: string, schedule: Omit<Schedule, "id">): Promise<ApiResponse<Schedule>> => {
    return fetchApi<Schedule>(`/schedules/${id}`, "PUT", schedule);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/schedules/${id}`, "DELETE");
  },
};

// Рейсы (Обороты)
export const revolutionService = {
  getAll: async (): Promise<ApiResponse<Revolution[]>> => {
    return fetchApi<Revolution[]>("/revolutions");
  },

  getById: async (id: string): Promise<ApiResponse<Revolution>> => {
    return fetchApi<Revolution>(`/revolutions/${id}`);
  },

  create: async (revolution: Omit<Revolution, "id">): Promise<ApiResponse<Revolution>> => {
    return fetchApi<Revolution>("/revolutions", "POST", revolution);
  },

  update: async (id: string, revolution: Omit<Revolution, "id">): Promise<ApiResponse<Revolution>> => {
    return fetchApi<Revolution>(`/revolutions/${id}`, "PUT", revolution);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/revolutions/${id}`, "DELETE");
  },
};

// Выходы (BusLine)
export const busLineService = {
  getAll: async (): Promise<ApiResponse<BusLine[]>> => {
    return fetchApi<BusLine[]>("/bus-lines");
  },

  getById: async (id: string): Promise<ApiResponse<BusLine>> => {
    return fetchApi<BusLine>(`/bus-lines/${id}`);
  },

  getByRouteId: async (routeId: string): Promise<ApiResponse<BusLine[]>> => {
    return fetchApi<BusLine[]>(`/bus-lines/by-route/${routeId}`);
  },

  create: async (busLine: Omit<BusLine, "id">): Promise<ApiResponse<BusLine>> => {
    return fetchApi<BusLine>("/bus-lines", "POST", busLine);
  },

  update: async (id: string, busLine: Omit<BusLine, "id">): Promise<ApiResponse<BusLine>> => {
    return fetchApi<BusLine>(`/bus-lines/${id}`, "PUT", busLine);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/bus-lines/${id}`, "DELETE");
  },
};

// Аналитика автопарка (для дашборда)
export const analyticsService = {
  getFleetStats: async (): Promise<FleetStats> => {
    try {
      const [buses, routes, drivers] = await Promise.all([
        busService.getAll(),
        routeService.getAll(),
        driverService.getAll(),
      ]);

      const maintenanceBuses = buses.value?.filter((bus) => bus.busStatus === "UnderRepair" || bus.busStatus === "LongTermRepair").length || 0;

      return {
        totalBuses: buses.value?.length || 0,
        activeRoutes: routes.value?.length || 0,
        drivers: drivers.value?.length || 0,
        maintenanceBuses,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики автопарка:", error);
      throw error;
    }
  },

  getFleetStatus: async (): Promise<FleetStatus> => {
    try {
      const buses = await busService.getAll();

      if (!buses.value || buses.value.length === 0) {
        return { operational: 0, inMaintenance: 0, outOfService: 0 };
      }

      const total = buses.value.length;
      const operational = buses.value.filter((bus) => bus.busStatus === "OnWork").length;
      const inMaintenance = buses.value.filter((bus) => bus.busStatus === "UnderRepair" || bus.busStatus === "LongTermRepair").length;
      const outOfService = buses.value.filter((bus) => bus.busStatus === "Decommissioned").length;

      return {
        operational: Math.round((operational / total) * 100),
        inMaintenance: Math.round((inMaintenance / total) * 100),
        outOfService: Math.round((outOfService / total) * 100),
      };
    } catch (error) {
      console.error("Ошибка при получении статуса автопарка:", error);
      throw error;
    }
  },
};