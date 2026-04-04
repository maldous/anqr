// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:234

export function isRateLimitError(errStr) {
  return (
    errStr.includes("rate_limit") ||
    errStr.includes("rate limit") ||
    errStr.includes("too many requests") ||
    errStr.includes("quota exceeded") ||
    errStr.includes("throttled")
  );
}
