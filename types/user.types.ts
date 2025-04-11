// types/user.types.ts
export interface User {
    id: string;
    fullName: string;
    email: string;
    login: string;
    role: string;
    busDepotId?: string;
    convoyNumber?: number;
    convoyId?: string;
  }
  
  export interface UpdateUserRequest {
    fullName: string;
    role: string;
  }
  export interface ApiResponse<T> {
    isSuccess: boolean;
    error: string | null;
    statusCode: number;
    value: T | null;
  }
  
  export interface UserContext {
    userId: string;
    userName: string;
    convoyId: string;
    convoyNumber: number;
  }
