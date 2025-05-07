// utils/routeStatusUtils.ts

export type BackendRouteStatus = "Workday" | "Saturday" | "Sunday";
export type FrontendRouteStatus = "Будни" | "Суббота" | "Воскресенье" | "Все";

/** 
 * Связка backend => frontend 
 */
const statusMap: Record<BackendRouteStatus, FrontendRouteStatus> = {
  Workday: "Будни",
  Saturday: "Суббота",
  Sunday: "Воскресенье",
};

/**
 * Связка frontend => backend
 * Специально указываем "Все" как "Workday" для запросов (иначе сервер 400).
 */
const reverseStatusMap: Record<FrontendRouteStatus, BackendRouteStatus> = {
  Будни: "Workday",
  Суббота: "Saturday",
  Воскресенье: "Sunday",
  Все: "Workday",
};

/**
 * Перевести статус маршрута с backend на frontend
 */
export const toFrontendStatus = (backendStatus: BackendRouteStatus): FrontendRouteStatus => {
  return statusMap[backendStatus];
};

/**
 * Перевести статус маршрута с frontend на backend
 */
export const toBackendStatus = (frontendStatus: FrontendRouteStatus): BackendRouteStatus => {
  return reverseStatusMap[frontendStatus] || "Workday"; // fallback защита
};

/**
 * Получить цвет бейджа для статуса
 */
export const getStatusColor = (status: FrontendRouteStatus): string => {
  switch (status) {
    case "Будни":
      return "bg-blue-100 text-blue-800";
    case "Суббота":
      return "bg-amber-100 text-amber-800";
    case "Воскресенье":
      return "bg-green-100 text-green-800";
    case "Все":
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Получить градиент карточки для статуса
 */
export const getStatusGradient = (status: FrontendRouteStatus): string => {
  switch (status) {
    case "Будни":
      return "from-blue-500 to-blue-600";
    case "Суббота":
      return "from-amber-500 to-amber-600";
    case "Воскресенье":
      return "from-green-500 to-green-600";
    case "Все":
    default:
      return "from-gray-500 to-gray-600";
  }
};
