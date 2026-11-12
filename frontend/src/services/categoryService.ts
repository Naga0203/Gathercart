import apiClient from './api';
import type { ApiResponse } from '../types/api';
import type { Category } from '../types/product';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data || [];
  },
};

