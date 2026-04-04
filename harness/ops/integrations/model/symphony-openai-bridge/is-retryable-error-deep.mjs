// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:3652

import { isRetryableError } from "./is-retryable-error.mjs";
import { unwrapAIError } from "./unwrap-aierror.mjs";

export function isRetryableErrorDeep(err) {
  if (isRetryableError(err)) return true;
  if (err?.responseBody && isRetryableError(err.responseBody)) return true;
  if (err?.data && isRetryableError(JSON.stringify(err.data))) return true;
  const root = unwrapAIError(err);
  if (root !== err) {
    if (isRetryableError(root)) return true;
    if (root?.responseBody && isRetryableError(root.responseBody)) return true;
    if (root?.data && isRetryableError(JSON.stringify(root.data))) return true;
  }
  return false;
}
