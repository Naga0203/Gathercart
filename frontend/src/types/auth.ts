export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  clusterId?: number;
  clusterName?: string;
  penaltyCount?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  clusterId?: number;
  addressLine1?: string;
  addressLine2?: string;
  handoverPreference?: string;
  preferredPickupNodeId?: number;
  agreedToTerms: boolean;
}

export interface AuthResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  clusterName?: string;
  token: string;
}

