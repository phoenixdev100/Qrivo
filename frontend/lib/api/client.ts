import { config } from '../config';
import { ApiRequestError, type ApiResponse } from '@/types/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  // Skip the automatic refresh-and-retry (used by the refresh call itself).
  skipRefresh?: boolean;
  signal?: AbortSignal;
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

  return fetch(`${config.apiUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: 'include', // send/receive httpOnly auth cookies
    signal: options.signal,
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

  return body.data;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => apiRequest<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
