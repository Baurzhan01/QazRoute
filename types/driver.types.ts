// types/driver.types.ts
export interface Driver {
    id?: string;
    fullName: string;
    serviceNumber: string;
    address: string;
    phone: string;
    birthDate: {
      year: number;
      month: number;
      day: number;
      dayOfWeek?: number;
    };
    additionalInfo: string;
    driverStatus: string;
    busId?: string;
    convoyId?: string;
  }
  
  export interface CreateDriverRequest {
    fullName: string;
    serviceNumber: string;
    address: string;
    phone: string;
    birthDate: {
      year: number;
      month: number;
      day: number;
      dayOfWeek?: number;
    };
    additionalInfo: string;
    driverStatus: string;
    busId?: string;
    convoyId?: string;
  }
  
  export interface UpdateDriverRequest {
    fullName: string;
    serviceNumber: string;
    address: string;
    phone: string;
    birthDate: {
      year: number;
      month: number;
      day: number;
      dayOfWeek?: number;
    };
    additionalInfo: string;
    driverStatus: string;
    busId?: string;
    convoyId?: string;
  }
  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }