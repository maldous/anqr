import { FAILURE_COOLDOWN_MS } from "./failure-cooldown-ms.mjs";
import { HEALTH_CACHE_TTL_MS } from "./health-cache-ttl-ms.mjs";
import { setHealthCache } from "./set-health-cache.mjs";

export function rememberHealth(value) {
  const now = Date.now();
  setHealthCache({
    value,
    expiresAt: now + HEALTH_CACHE_TTL_MS,
    nextRetryAt: value ? now : now + FAILURE_COOLDOWN_MS,
  });
}
