
export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }
  
  export interface Convoy {
    id: string;
    number: number;
    busDepotId: string;
    chiefId?: string;
    mechanicId?: string;
    chief?: { id: string; fullName: string };
    mechanic?: { id: string; fullName: string };
    busIds?: string[];
    buses?: any[];
    driversCount?: number;
  }
  
  export interface CreateConvoyRequest {
    number: number;
    busDepotId: string;
    chiefId: string;
    mechanicId: string;
  }
  
  export interface UpdateConvoyRequest {
    number: number;
    busDepotId: string;
    chiefId: string;
    mechanicId: string;
  }