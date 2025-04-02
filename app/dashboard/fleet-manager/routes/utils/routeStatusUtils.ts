// utils/routeStatusUtils.ts
export type BackendRouteStatus = "Workday" | "Saturday" | "Sunday";
export type FrontendRouteStatus = "Будни" | "Суббота" | "Воскресенье";

const statusMap: Record<BackendRouteStatus, FrontendRouteStatus> = {
  Workday: "Будни",
  Saturday: "Суббота",
  Sunday: "Воскресенье",
};

const reverseStatusMap: Record<FrontendRouteStatus, BackendRouteStatus> = {
  Будни: "Workday",
  Суббота: "Saturday",
  Воскресенье: "Sunday",
};

export const toFrontendStatus = (backendStatus: BackendRouteStatus): FrontendRouteStatus => {
  return statusMap[backendStatus];
};

export const toBackendStatus = (frontendStatus: FrontendRouteStatus): BackendRouteStatus => {
  return reverseStatusMap[frontendStatus];
};

export const getStatusColor = (status: FrontendRouteStatus): string => {
  switch (status) {
    case "Будни":
      return "bg-blue-100 text-blue-800";
    case "Суббота":
      return "bg-amber-100 text-amber-800";
    case "Воскресенье":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusGradient = (status: FrontendRouteStatus): string => {
  switch (status) {
    case "Будни":
      return "from-blue-500 to-blue-600";
    case "Суббота":
      return "from-amber-500 to-amber-600";
    case "Воскресенье":
      return "from-green-500 to-green-600";
    default:
      return "from-gray-500 to-gray-600";
  }
};