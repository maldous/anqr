export interface ApiErrorResponse {
  readonly error: string;
  readonly code?: string;
  readonly status?: number;
}
