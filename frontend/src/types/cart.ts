export type FulfillmentType = 'STORE_PICKUP' | 'HOME_DELIVERY';

export interface UpdateFulfillmentPayload {
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  unitLabel: string;
  imageUrl?: string;
  quantity: number;
  mrpUnitPrice: number;
  appliedUnitPrice: number;
  mrpSubtotal: number;
  itemSubtotal: number;
  itemSavings: number;
  savingsPercent: number;
  isGroupPriceApplied: boolean;
  activeBatchCode?: string | null;
  maxAllowedQuantity: number;
}

export interface Cart {
  id: number;
  userId?: number | null;
  sessionId?: string | null;
  clusterId: number;
  items: CartItem[];
  totalItems: number;
  itemCount: number;
  mrpSubtotal: number;
  subtotal: number;
  applicableDiscounts: number;
  estimatedSavings: number;
  deliveryFee: number;
  finalEstimatedTotal: number;
  deliveryNote: string;
  fulfillmentType?: FulfillmentType;
  deliveryAddress?: string | null;
}

export interface AddToCartPayload {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

