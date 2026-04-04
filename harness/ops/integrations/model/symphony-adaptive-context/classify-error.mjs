import { ERROR_TYPES } from "./error-types.mjs";
import { extractErrorString } from "./extract-error-string.mjs";
import { getStatusCode } from "./get-status-code.mjs";
import { isAuthError } from "./is-auth-error.mjs";
import { isContextError } from "./is-context-error.mjs";
import { isRateLimitError } from "./is-rate-limit-error.mjs";
import { isServerError } from "./is-server-error.mjs";
import { isTimeoutError } from "./is-timeout-error.mjs";
import { isToolHallucinationError } from "./is-tool-hallucination-error.mjs";

export function classifyError(err) {
  const statusCode = getStatusCode(err);
  const errStr = extractErrorString(err);

  if (statusCode === 413 || isContextError(errStr)) return ERROR_TYPES.CONTEXT_TOO_LARGE;
  if (statusCode === 429 || isRateLimitError(errStr)) return ERROR_TYPES.RATE_LIMITED;
  if (statusCode === 401 || statusCode === 403 || isAuthError(errStr))
    return ERROR_TYPES.AUTH_ERROR;
  if (statusCode === 408 || isTimeoutError(errStr)) return ERROR_TYPES.TIMEOUT;
  if ((statusCode && statusCode >= 500) || isServerError(errStr)) return ERROR_TYPES.SERVER_ERROR;
  if (isToolHallucinationError(errStr)) return ERROR_TYPES.TOOL_HALLUCINATION;
  return ERROR_TYPES.UNKNOWN;
}
