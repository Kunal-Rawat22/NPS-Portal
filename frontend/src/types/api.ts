export interface ApiResponse<T = unknown> {
  status: boolean;
  requestId: string;
  message: string;
  data?: T | null;
}

export interface ApiResponseList<T = unknown> {
  status: boolean;
  requestId: string;
  message: string;
  data: T[];
}

export function isApiEnvelope(data: unknown): data is ApiResponse | ApiResponseList {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.status === 'boolean' &&
    typeof obj.requestId === 'string' &&
    typeof obj.message === 'string'
  );
}

export function isApiResponse(data: unknown): data is ApiResponse {
  return isApiEnvelope(data) && !Array.isArray((data as ApiResponse).data);
}

export function isApiResponseList(data: unknown): data is ApiResponseList {
  return isApiEnvelope(data) && Array.isArray((data as ApiResponseList).data);
}

export function unwrapApiData<T>(data: unknown): T {
  if (isApiResponseList(data)) {
    return data.data as T;
  }
  if (isApiResponse(data) || isApiEnvelope(data)) {
    return ((data as ApiResponse).data ?? null) as T;
  }
  return data as T;
}
