import type { ApiErrorDetail } from "./api-error-detail.contract";

export interface ApiError {
  readonly ok: false;
  readonly error: ApiErrorDetail;
}
