export type ApiErrorCode =
  | 'validation_error'
  | 'not_found'
  | 'conflict'
  | 'unauthorized'
  | 'forbidden'
  | 'internal_error'
  | 'network_error';

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  code: ApiErrorCode | string;
  message: string;
  fields?: ApiFieldError[];
}

export interface ApiSuccessEnvelope<T> {
  data: T;
}

export interface ApiErrorEnvelope {
  error: ApiErrorBody;
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields?: ApiFieldError[];

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiClientError';
    this.code = body.code;
    this.status = status;
    this.fields = body.fields;
  }
}
