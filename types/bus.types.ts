// types/bus.types.ts
export enum BusStatus {
    OnWork = 'OnWork',
    UnderRepair = 'UnderRepair',
    LongTermRepair = 'LongTermRepair',
    OutOfService = 'OutOfService',
  }
  
export interface Bus {
    id?: string;
    govNumber: string;
    garageNumber: string;
    additionalInfo: string;
    busLineId: string;
    busStatus: BusStatus;
    convoyId: string;
  }
  
  export interface CreateBusRequest {
    govNumber: string;
    garageNumber: string;
    additionalInfo: string;
    busLineId: string;
    busStatus: BusStatus;
    convoyId: string;
  }
  
  export interface UpdateBusRequest {
    govNumber: string;
    garageNumber: string;
    additionalInfo: string;
    busLineId: string;
    busStatus: BusStatus;
    convoyId: string;
  }
  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }
  