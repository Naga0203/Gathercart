import apiClient from './api';
import type { ApiResponse } from '../types/api';
import type { Order } from '../types/order';

export const orderService = {
  checkout: async (): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>('/orders/checkout');
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to checkout');
    }
    return res.data.data;
  },

  getUserOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return res.data.data || [];
  },

  getOrderById: async (id: number | string): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Order not found');
    }
    return res.data.data;
  },
};

