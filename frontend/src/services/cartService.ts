import apiClient from './api';
import type { ApiResponse } from '../types/api';
import type { Cart, AddToCartPayload, UpdateCartItemPayload } from '../types/cart';

const USER_ID_HEADER = '1';
const CART_UPDATED_EVENT = 'gathercart:cart-updated';

export const cartService = {
  async getCart(): Promise<Cart> {
    const res = await apiClient.get<ApiResponse<Cart>>('/cart', {
      headers: {
        'X-User-Id': USER_ID_HEADER,
      },
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to retrieve cart');
    }
    return res.data.data;
  },

  async addToCart(payload: AddToCartPayload): Promise<Cart> {
    const res = await apiClient.post<ApiResponse<Cart>>('/cart/items', payload, {
      headers: {
        'X-User-Id': USER_ID_HEADER,
      },
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to add item to cart');
    }
    this.notifyCartUpdated(res.data.data);
    return res.data.data;
  },

  async updateQuantity(itemId: number, payload: UpdateCartItemPayload): Promise<Cart> {
    const res = await apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, payload, {
      headers: {
        'X-User-Id': USER_ID_HEADER,
      },
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update item quantity');
    }
    this.notifyCartUpdated(res.data.data);
    return res.data.data;
  },

  async removeItem(itemId: number): Promise<Cart> {
    const res = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
      headers: {
        'X-User-Id': USER_ID_HEADER,
      },
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to remove item from cart');
    }
    this.notifyCartUpdated(res.data.data);
    return res.data.data;
  },

  async clearCart(): Promise<Cart> {
    const res = await apiClient.delete<ApiResponse<Cart>>('/cart', {
      headers: {
        'X-User-Id': USER_ID_HEADER,
      },
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to clear cart');
    }
    this.notifyCartUpdated(res.data.data);
    return res.data.data;
  },

  notifyCartUpdated(cart: Cart) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: cart }));
    }
  },

  onCartUpdated(callback: (cart: Cart) => void) {
    if (typeof window === 'undefined') return () => {};
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<Cart>;
      callback(customEvent.detail);
    };
    window.addEventListener(CART_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handler);
  },
};
