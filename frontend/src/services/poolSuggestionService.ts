import apiClient from './api';
import type { ApiResponse } from '../types/api';

export interface PoolSuggestionPayload {
  productName: string;
  category?: string;
  clusterName?: string;
  notes?: string;
  contactPhone?: string;
}

export interface PoolSuggestion {
  id: number;
  productName: string;
  category?: string;
  clusterName?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

export const poolSuggestionService = {
  async createSuggestion(payload: PoolSuggestionPayload): Promise<PoolSuggestion> {
    const res = await apiClient.post<ApiResponse<PoolSuggestion>>('/pool-suggestions', payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to submit suggestion');
    }
    return res.data.data;
  },
};
