import type { ApiError } from "./api-error.contract";
import type { ApiSuccess } from "./api-success.contract";

export type ApiResult<T> = ApiSuccess<T> | ApiError;
