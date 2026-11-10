export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: ApiFieldError[];
  timestamp: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
}
