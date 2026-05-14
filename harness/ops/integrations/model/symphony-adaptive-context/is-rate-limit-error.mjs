export function isRateLimitError(errStr) {
  const s = String(errStr || "").toLowerCase();
  return (
    s.includes("rate_limit") ||
    s.includes("rate limit") ||
    s.includes("too many requests") ||
    s.includes("quota exceeded") ||
    s.includes("throttled") ||
    s.includes("session limit") ||
    s.includes("weekly limit") ||
    s.includes("limit resets") ||
    s.includes("continue with credits")
  );
}
