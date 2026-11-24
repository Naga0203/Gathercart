import apiClient from './api';
import type { ApiResponse } from '../types/api';
import type { AuthResponse, LoginPayload, RegisterPayload, AuthUser } from '../types/auth';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Registration failed');
    }
    return res.data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Login failed');
    }
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/auth/logout');
  },

  async getMe(): Promise<AuthUser> {
    const res = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to get user profile');
    }
    return res.data.data;
  },
};

