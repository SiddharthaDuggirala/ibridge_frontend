export interface ApiEnvelope<T> {
    success: boolean | null;
    data: T;
    meta: Record<string, unknown>;
    errors: string[];
    error_code: string | number | null;
  }

  
  export interface ApiError {
    status: number | string;
    message: string;
  }