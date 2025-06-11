export interface AuthRequest {
  login: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  login: string
  password: string
  role: string
  busDepotId: string
  convoyId?: string
}

export interface LoginResponse {
  token: string
  role: string
  fullName: string
  id: string
  busDepotId: string | null
  convoyId: string | null
  convoyNumber: string | null
}

export interface UpdateUserRequest {
  fullName: string
  role: string
  busDepotId?: string // ✅ Добавить
  convoyId?: string   // ✅ Добавить
  convoyNumber?: number // ✅ Добавить, если используешь
}
export interface ApiResponse<T> {
  isSuccess: boolean;
  error: string | null;
  statusCode: number;
  value: T | null;
}
