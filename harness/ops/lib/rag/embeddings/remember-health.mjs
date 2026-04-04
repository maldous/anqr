// Generated from ../../../../scripts/ops/lib/rag/embeddings.mjs:29,52

import { FAILURE_COOLDOWN_MS } from "./failure-cooldown-ms.mjs";
import { HEALTH_CACHE_TTL_MS } from "./health-cache-ttl-ms.mjs";

export let healthCache = {
  value: null,
  expiresAt: 0,
  nextRetryAt: 0,
};

export function setHealthCache(value) {
  healthCache = value;
}

export function rememberHealth(value) {
  const now = Date.now();
  setHealthCache({
    value,
    expiresAt: now + HEALTH_CACHE_TTL_MS,
    nextRetryAt: value ? now : now + FAILURE_COOLDOWN_MS,
  });
}
