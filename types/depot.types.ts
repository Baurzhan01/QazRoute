// types/depot.types.ts
export interface BusDepot {
    id: string;
    name: string;
    city: string;
    address: string;
    fleetManagerCount?: number;
    mechanicCount?: number;
    otherEmployeesCount?: number;
    employeesCount?: number;
  }
  
  export interface CreateBusDepotRequest {
    name: string;
    city: string;
    address: string;
  }
  
  export interface UpdateBusDepotRequest {
    name: string;
    city: string;
    address: string;
  }
  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }