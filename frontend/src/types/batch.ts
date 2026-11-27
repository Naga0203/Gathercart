import type { ProductSummary } from './product';

export type GroupPurchaseStatus =
  | 'OPEN'
  | 'CONFIRMED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'EXPIRED'
  | 'CANCELLED';

export type GroupParticipantStatus =
  | 'ACTIVE'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CANCELLED'
  | 'RELEASED';

export interface BatchParticipant {
  id: number;
  commitmentCode: string;
  groupPurchaseId: number;
  productId?: number;
  batchCode?: string;
  displayName: string;
  initials: string;
  location?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  mrpTotal: number;
  savings: number;
  status: GroupParticipantStatus;
  pledgedAt: string;
  timeAgo?: string;
  isCurrentUser?: boolean;
  productName?: string;
  productImageUrl?: string;
  unitLabel?: string;
}

export interface BatchResponse {
  id: number;
  batchCode: string;
  product: ProductSummary;
  clusterName?: string;
  targetQuantity: number;
  currentQuantity: number;
  remainingQuantity: number;
  progressPercent: number;
  householdLimit: number;
  status: GroupPurchaseStatus;
  deadline: string;
  paymentWindowMins: number;
  paymentDeadline?: string;
  leadOrganiser?: string;
  hubDropLocation?: string;
  isFreeDelivery: boolean;
  contextMessage?: string;
  totalParticipants: number;
  recentParticipants: BatchParticipant[];
}

export interface JoinBatchPayload {
  quantity: number;
  phone?: string;
  displayName?: string;
  location?: string;
}

export interface UpdatePledgePayload {
  quantity: number;
}

