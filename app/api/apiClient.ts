// app/api/apiClient.ts
import axios from 'axios';
import type { ApiResponse } from '@/types/api.types';
import { API_BASE_URL } from './apiService';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена в заголовки
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Интерцептор для обработки ответов
// apiClient.interceptors.response.use(
//   (response) => {
//     // Модифицируем response.data в формате ApiResponse
//     response.data = {
//       isSuccess: true,
//       error: null,
//       statusCode: response.status,
//       value: response.data,
//     };
//     return response;
//   },
//   (error) => {
//     // Модифицируем error.response.data в формате ApiResponse
//     if (error.response) {
//       error.response.data = {
//         isSuccess: false,
//         error: error.response.data?.error || 'Ошибка запроса',
//         statusCode: error.response.status,
//         value: null,
//       };
//     }
//     return Promise.reject(error);
//   },
// );

export default apiClient;