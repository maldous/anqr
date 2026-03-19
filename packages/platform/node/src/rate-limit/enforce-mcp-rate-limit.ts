import { createRateLimitResponse } from "./create-rate-limit-response";
import { getClientKey } from "./get-client-key";
import { getRateLimitPerMinute } from "./get-rate-limit-per-minute";
import { MCP_RATE_LIMIT_WINDOW_MS } from "./mcp-rate-limit.const";
import type { RateLimitEntry } from "./rate-limit-entry.types";

const requestCounts = new Map<string, RateLimitEntry>();

export function enforceMcpRateLimit(request: Request): Response | null {
  const limit = getRateLimitPerMinute();
  const key = getClientKey(request);
  const now = Date.now();
  const current = requestCounts.get(key);

  if (!current || current.resetAtMs <= now) {
    requestCounts.set(key, { count: 1, resetAtMs: now + MCP_RATE_LIMIT_WINDOW_MS });
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
