import type { FulfillmentType } from './cart';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitLabel: string;
  imageUrl?: string;
  quantity: number;
  mrpUnitPrice: number;
  appliedUnitPrice: number;
  itemSubtotal: number;
  savingsAmount: number;
  savingsPercent: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  clusterId: number;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  status: OrderStatus;
  mrpSubtotal: number;
  discountAmount: number;
  subtotal: number;
  deliveryFee: number;
  finalTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

