export interface ApiErrorDetail {
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
}
