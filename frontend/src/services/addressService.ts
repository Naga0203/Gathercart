import apiClient from './api';
import type { ApiResponse } from '../types/api';

export interface Address {
  id: number;
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  isDefault: boolean;
}

export interface AddressPayload {
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  isDefault?: boolean;
}

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const res = await apiClient.get<ApiResponse<Address[]>>('/addresses');
    return res.data.data || [];
  },

  async createAddress(payload: AddressPayload): Promise<Address> {
    const res = await apiClient.post<ApiResponse<Address>>('/addresses', payload);
    if (!res.data.data) throw new Error('Failed to create address');
    return res.data.data;
  },

  async updateAddress(id: number, payload: AddressPayload): Promise<Address> {
    const res = await apiClient.put<ApiResponse<Address>>(`/addresses/${id}`, payload);
    if (!res.data.data) throw new Error('Failed to update address');
    return res.data.data;
  },

  async deleteAddress(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/addresses/${id}`);
  },
};
