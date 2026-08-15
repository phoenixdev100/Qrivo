import { config } from '../config';
import { ApiRequestError, type ApiResponse } from '@/types/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  // Skip the automatic refresh-and-retry (used by the refresh call itself).
  skipRefresh?: boolean;
  signal?: AbortSignal;
  // Skip cache for this request
  skipCache?: boolean;
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

function getCacheKey(path: string, options: RequestOptions): string {
  return `${options.method || 'GET'}:${path}`;
}

function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function parseBody<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  if (!text) {
    return res.ok
      ? ({ success: true, data: {} as T } as ApiResponse<T>)
      : ({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Empty response' } });
  }
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: 'Invalid response' } };
  }
}

async function rawRequest<T>(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  if (options.signal) {
    options.signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      controller.abort();
    });
  }

  try {
    return await fetch(`${config.apiUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: 'include', // send/receive httpOnly auth cookies
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Public request without credentials for scan resolution
async function publicRequest<T>(url: string): Promise<Response> {
  return fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = rawRequest('/auth/refresh', { method: 'POST', skipRefresh: true })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const cacheKey = getCacheKey(path, options);
  
  // Check cache for GET requests only
  if (!options.skipCache && (options.method === 'GET' || !options.method)) {
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached as T;
    }
  }

  let res = await rawRequest<T>(path, options);

  // Attempt a single transparent token refresh on 401.
  if (res.status === 401 && !options.skipRefresh) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await rawRequest<T>(path, options);
    }
  }

  const body = await parseBody<T>(res);

  if (!res.ok || !body.success) {
    const err = !body.success
      ? body.error
      : { code: 'INTERNAL_ERROR', message: 'Request failed' };
    throw new ApiRequestError(res.status, err.code, err.message, 'details' in err ? err.details : undefined);
  }

  // Cache successful GET responses
  if (!options.skipCache && (options.method === 'GET' || !options.method)) {
    setCachedData(cacheKey, body.data);
  }

  return body.data;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => apiRequest<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
