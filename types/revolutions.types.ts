// types/revolutions.types.ts

export interface Revolution {
  id: string
  title: string
  description?: string
  date: string // ISO формат: "2025-05-18T00:00:00Z"
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateRevolutionRequest {
  title: string
  description?: string
  date: string // ISO строка
}

export interface UpdateRevolutionRequest {
  title: string
  description?: string
  date: string
}

export interface ApiResponse<T> {
  isSuccess: boolean
  error: string | null
  statusCode: number
  value: T
}
