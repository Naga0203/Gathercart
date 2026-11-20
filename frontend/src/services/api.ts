import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/constants';
import type { ApiResponse } from '../types/api';
import { getAuthToken } from '../features/auth/AuthContext';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor — attaches JWT from in-memory auth context
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — handles 401 by dispatching auth expiry event
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid — notify app to redirect to login
        window.dispatchEvent(new CustomEvent('gathercart:auth-expired'));
      }
      const responseData = error.response.data;
      console.error('API Error Response:', responseData || error.message);
    } else if (error.request) {
      console.error('API Network Error: Server unreachable', error.message);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
