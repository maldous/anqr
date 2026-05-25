import { createRateLimitResponse } from "./create-rate-limit-response";
import { getClientKey } from "./get-client-key";
import { getApiQrRateLimitPerMinute } from "./get-api-qr-rate-limit-per-minute";
import { API_QR_RATE_LIMIT_WINDOW_MS } from "./api-qr-rate-limit.const";
import type { RateLimitEntry } from "./rate-limit-entry.types";

// ADR-0016 (rate-limit defense-in-depth): this Map lives per Netlify
// container. Multiple warm containers means the effective per-client
// ceiling is `limit × container-count`, not a hard cap. Migrating to
// Netlify Blobs for a real ceiling adds 10-50ms per request — not
// worth it for spam protection. The 429 response carries
// `X-ANQR-RateLimit-Mode: approximate` so consumers can detect this.
const requestCounts = new Map<string, RateLimitEntry>();

export function enforceApiQrRateLimit(request: Request): Response | null {
  const limit = getApiQrRateLimitPerMinute();
  const key = getClientKey(request);
  const now = Date.now();
  const current = requestCounts.get(key);

  if (!current || current.resetAtMs <= now) {
    requestCounts.set(key, { count: 1, resetAtMs: now + API_QR_RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (current.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAtMs - now) / 1000));
    return createRateLimitResponse(retryAfterSeconds);
  }

  current.count += 1;
  requestCounts.set(key, current);
  return null;
}
