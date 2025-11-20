import { API_CONFIG } from '@/config/api';

export type ApiClientOptions = RequestInit & {
  skipAuth?: boolean;
  rawResponse?: boolean;
};

export interface ApiError extends Error {
  status?: number;
  detail?: unknown;
}

const ensureApiBase = (base: string) => {
  if (!base) return 'http://localhost:8000/api';
  if (base.endsWith('/api')) return base;
  return `${base.replace(/\/$/, '')}/api`;
};

const buildUrl = (endpoint: string) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const base = ensureApiBase(API_CONFIG.BASE_URL);

  if (endpoint.startsWith('/')) {
    return `${base}${endpoint}`;
  }

  return `${base}/${endpoint}`;
};

const buildHeaders = (options?: ApiClientOptions) => {
  const headers = new Headers(options?.headers);
  headers.set('Accept', headers.get('Accept') || 'application/json');

  const isFormData = options?.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options?.skipAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Token ${token}`);
    }
  }

  return headers;
};

const parseError = async (response: Response): Promise<ApiError> => {
  const error: ApiError = new Error('Request failed');
  error.status = response.status;

  try {
    const detail = await response.json();
    error.detail = detail;
    if (typeof detail === 'string') {
      error.message = detail;
    } else if (detail?.detail) {
      error.message = detail.detail;
    }
  } catch {
    error.message = response.statusText || 'Request failed';
  }

  return error;
};

export async function apiClient<TResponse = any>(
  endpoint: string,
  options?: ApiClientOptions
): Promise<TResponse> {
  const response = await fetch(buildUrl(endpoint), {
    ...options,
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (options?.rawResponse) {
    return response as unknown as TResponse;
  }

  if (response.status === 204) {
    return null as TResponse;
  }

  return (await response.json()) as TResponse;
}

type PaginatedResponse<T> = {
  results?: T[];
  data?: T[];
};

export const extractResults = <T>(payload: PaginatedResponse<T> | T[] | null | undefined): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

