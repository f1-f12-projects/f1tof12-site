export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  headers?: Record<string, string>;
}

export interface ApiError {
  detail: {
    error: string;
    message: string;
    code: string;
  };
}