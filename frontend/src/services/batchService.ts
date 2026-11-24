import apiClient from './api';
import type { ApiResponse, PagedResponse } from '../types/api';
import type {
  BatchResponse,
  BatchParticipant,
  JoinBatchPayload,
  GroupPurchaseStatus,
} from '../types/batch';

export interface BatchQueryParams {
  status?: GroupPurchaseStatus;
  filter?: string;
  categoryId?: number;
  page?: number;
  size?: number;
}

export const batchService = {
  async getBatches(params?: BatchQueryParams): Promise<PagedResponse<BatchResponse>> {
    const res = await apiClient.get<ApiResponse<PagedResponse<BatchResponse>>>('/batches', {
      params,
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to retrieve batches');
    }
    return res.data.data;
  },

  async getBatchById(id: number | string): Promise<BatchResponse> {
    const res = await apiClient.get<ApiResponse<BatchResponse>>(`/batches/${id}`);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Batch not found');
    }
    return res.data.data;
  },

  async getActiveBatchByProductId(productId: number | string): Promise<BatchResponse | null> {
    try {
      const res = await apiClient.get<ApiResponse<BatchResponse>>(`/batches/by-product/${productId}`);
      return res.data.data || null;
    } catch {
      // Return null when no active batch exists for this product
      return null;
    }
  },

  async getParticipants(batchId: number | string): Promise<BatchParticipant[]> {
    const res = await apiClient.get<ApiResponse<BatchParticipant[]>>(`/batches/${batchId}/participants`);
    return res.data.data || [];
  },

  async getMyPledges(): Promise<BatchParticipant[]> {
    const res = await apiClient.get<ApiResponse<BatchParticipant[]>>('/batches/my-pledges');
    return res.data.data || [];
  },

  async joinBatch(batchId: number | string, payload: JoinBatchPayload): Promise<BatchParticipant> {
    const res = await apiClient.post<ApiResponse<BatchParticipant>>(`/batches/${batchId}/pledge`, payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to confirm pledge');
    }
    return res.data.data;
  },

  async updatePledgeQuantity(participantId: number | string, quantity: number): Promise<BatchParticipant> {
    const res = await apiClient.patch<ApiResponse<BatchParticipant>>(`/batches/pledges/${participantId}`, {
      quantity,
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update pledge quantity');
    }
    return res.data.data;
  },

  async cancelPledge(participantId: number | string): Promise<void> {
    const res = await apiClient.delete<ApiResponse<void>>(`/batches/pledges/${participantId}`);
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to cancel pledge');
    }
  },
};

