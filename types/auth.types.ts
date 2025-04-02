// types/auth.types.ts
export interface AuthRequest {
    login: string;
    password: string;
  }
  
  export interface RegisterRequest {
    fullName: string;
    email: string;
    login: string;
    password: string;
    role: string;
    busDepotId: string;
  }
  
  export interface LoginResponse {
    token: string;
    role: string;
    fullName: string;
    convoyNumber: string;
    busDepotId: string;
  }
  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }