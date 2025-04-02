// services/scheduleService.ts
import apiClient from '../app/api/apiClient';
import type { ApiResponse, Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '../types/schedule.types';

export const scheduleService = {
  getAll: async (): Promise<ApiResponse<Schedule[]>> => {
    const response = await apiClient.get<ApiResponse<Schedule[]>>('/schedules');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Schedule>> => {
    const response = await apiClient.get<ApiResponse<Schedule>>(`/schedules/${id}`);
    return response.data;
  },

  create: async (data: CreateScheduleRequest): Promise<ApiResponse<Schedule>> => {
    const response = await apiClient.post<ApiResponse<Schedule>>('/schedules', data);
    return response.data;
  },

  update: async (id: string, data: UpdateScheduleRequest): Promise<ApiResponse<Schedule>> => {
    const response = await apiClient.put<ApiResponse<Schedule>>(`/schedules/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/schedules/${id}`);
    return response.data;
  },
};