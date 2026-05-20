/**
 * Global standard API response types.
 * Adjust these interfaces based on how your backend team structures their JSON responses.
 */

// Example: Standard wrapper for all API responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Example: Standard pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}
