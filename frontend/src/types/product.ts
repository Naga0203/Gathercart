export interface Category {
  id: number;
  name: string;
  icon?: string;
  displayOrder?: number;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
  isVerified: boolean;
}

export interface CoopProfile {
  id: number;
  coopIdCode: string;
  name: string;
  location: string;
  description?: string;
  isVerified: boolean;
}

export interface ProductSummary {
  id: number;
  name: string;
  description: string;
  unitLabel: string;
  unitWeightKg?: number;
  mrp: number;
  groupPrice: number;
  savingsAmount: number;
  savingsPercent: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  isLabVerified: boolean;
  isPesticideTested: boolean;
  isActive: boolean;
}

export interface ProductDetail extends ProductSummary {
  detailedDescription?: string;
  images: ProductImage[];
  harvestDate?: string;
  moistureLevel?: string;
  grainType?: string;
  processing?: string;
  culinaryProfile?: string;
  qualityMetrics?: string;
  coopProfile?: CoopProfile;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQueryParams {
  categoryId?: number;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

