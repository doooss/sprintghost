// Common API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Common entity types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types (example)
export interface User extends BaseEntity {
  email: string;
  name: string;
}
