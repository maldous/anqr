/**
 * Per-route rate limit for /api/contract/qr.
 *
 * Defaults to 60 req/min (matches api-qr-rate-limit-policy.ts), overridable
 * via the API_QR_RATE_LIMIT_PER_MINUTE env var. Previously this route shared
 * `getRateLimitPerMinute()` with /api/mcp via MCP_RATE_LIMIT_PER_MINUTE,
 * causing operator-set values to silently affect both routes. See
 * review-2026-05-24 C-F3.
 */
export function getApiQrRateLimitPerMinute(): number {
  const configured = Number(process.env.API_QR_RATE_LIMIT_PER_MINUTE || "60");
  return Number.isFinite(configured) && configured > 0 ? configured : 60;
}
