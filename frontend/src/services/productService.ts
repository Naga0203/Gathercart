import apiClient from './api';
import type { ApiResponse, PagedResponse } from '../types/api';
import type { ProductSummary, ProductDetail, ProductQueryParams } from '../types/product';

export const productService = {
  async getProducts(params?: ProductQueryParams): Promise<PagedResponse<ProductSummary>> {
    const res = await apiClient.get<ApiResponse<PagedResponse<ProductSummary>>>('/products', {
      params,
    });
    return res.data.data || {
      content: [],
      page: 0,
      size: 12,
      totalElements: 0,
      totalPages: 0,
      last: true,
    };
  },

  async getProductById(id: number | string): Promise<ProductDetail> {
    const res = await apiClient.get<ApiResponse<ProductDetail>>(`/products/${id}`);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Product not found');
    }
    return res.data.data;
  },
};

