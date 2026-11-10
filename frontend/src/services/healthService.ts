import apiClient from './api';
import type { ApiResponse, HealthStatus } from '../types/api';

export const checkHealth = async (): Promise<ApiResponse<HealthStatus>> => {
  const response = await apiClient.get<ApiResponse<HealthStatus>>('/health');
  return response.data;
};
