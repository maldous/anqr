// Generated from ../../../../scripts/ops/integrations/model/codebuff-direct.mjs:96

export function isRateLimitError(errStr) {
  const s = String(errStr || "").toLowerCase();
  return (
    s.includes("429") ||
    s.includes("rate_limit") ||
    s.includes("rate limit") ||
    s.includes("too many requests") ||
    s.includes("session limit") ||
    s.includes("weekly limit") ||
    s.includes("limit resets") ||
    s.includes("continue with credits")
  );
}
