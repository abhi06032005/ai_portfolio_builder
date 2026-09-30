// Generic API response shapes
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// Helper to build success/error responses uniformly
export const ok = <T>(data: T): ApiSuccess<T> => ({ success: true, data });
export const err = (error: string, details?: unknown): ApiError => ({
  success: false,
  error,
  details,
});
