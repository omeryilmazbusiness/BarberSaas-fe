import { env } from '../config/env';
import { HeaderName } from './endpoints';
import {
  ApiClientError,
  type ApiErrorEnvelope,
  type ApiSuccessEnvelope,
} from './types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  path: string;
  body?: unknown;
  /** Absolute path (e.g. /healthz) — skips /api/v1 prefix. */
  absolute?: boolean;
  headers?: Record<string, string>;
  /** When false, Authorization is not attached. */
  auth?: boolean;
}

export interface TokenProvider {
  getAccessToken(): Promise<string | null>;
}

/**
 * Transport abstraction (Dependency Inversion).
 * Feature services depend on this, not on fetch.
 */
export interface HttpClient {
  request<T>(options: RequestOptions): Promise<T>;
}

export class FetchHttpClient implements HttpClient {
  constructor(
    private readonly baseUrl: string = env.apiBaseUrl,
    private readonly apiPrefix: string = env.apiPrefix,
    private readonly tokens: TokenProvider | null = null,
  ) {}

  async request<T>(options: RequestOptions): Promise<T> {
    const method = options.method ?? 'GET';
    const path = options.absolute
      ? options.path
      : `${this.apiPrefix}${options.path}`;
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      [HeaderName.ContentType]: 'application/json',
      ...options.headers,
    };

    if (options.auth !== false && this.tokens) {
      const token = await this.tokens.getAccessToken();
      if (token) {
        headers[HeaderName.Authorization] = `Bearer ${token}`;
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      throw new ApiClientError(0, {
        code: 'network_error',
        message: 'Unable to reach the API. Check that the backend is running.',
      });
    }

    const payload = (await response.json().catch(() => null)) as
      | ApiSuccessEnvelope<T>
      | ApiErrorEnvelope
      | null;

    if (!response.ok) {
      const errorBody =
        payload && 'error' in payload
          ? payload.error
          : {
              code: 'internal_error',
              message: `Request failed (${response.status})`,
            };
      throw new ApiClientError(response.status, errorBody);
    }

    if (payload && 'data' in payload) {
      return payload.data;
    }

    throw new ApiClientError(response.status, {
      code: 'internal_error',
      message: 'Unexpected API response shape',
    });
  }
}
