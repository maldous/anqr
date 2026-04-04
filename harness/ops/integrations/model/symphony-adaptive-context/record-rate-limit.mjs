// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:459

import { RATE_LIMIT_DEFAULT_BACKOFF_MS } from "./rate-limit-default-backoff-ms.mjs";
import { RATE_LIMIT_MAX_BACKOFF_MS } from "./rate-limit-max-backoff-ms.mjs";
import { getOrCreateState } from "./get-or-create-state.mjs";
import { logInfo } from "./logger.mjs";

export function recordRateLimit(providerName, info) {
  const { retryAfterMs, rpmLimit, rpmRemaining, rpmResetAt, tpmLimit, tpmRemaining, tpmResetAt } =
    info || {};
  const state = getOrCreateState(providerName);
  const backoff = Math.min(
    retryAfterMs || RATE_LIMIT_DEFAULT_BACKOFF_MS,
    RATE_LIMIT_MAX_BACKOFF_MS,
  );
  state.rateLimit.throttledUntil = Date.now() + backoff;
  state.rateLimit.lastRetryAfterMs = backoff;

  if (rpmLimit != null) state.rateLimit.rpmLimit = rpmLimit;
  if (rpmRemaining != null) state.rateLimit.rpmRemaining = rpmRemaining;
  if (rpmResetAt != null) state.rateLimit.rpmResetAt = rpmResetAt;
  if (tpmLimit != null) state.rateLimit.tpmLimit = tpmLimit;
  if (tpmRemaining != null) state.rateLimit.tpmRemaining = tpmRemaining;
  if (tpmResetAt != null) state.rateLimit.tpmResetAt = tpmResetAt;

  logInfo(`🛑 Adaptive rate-limit: ${providerName} throttled for ${backoff}ms`, {
    providerName,
    backoffMs: backoff,
    throttledUntil: state.rateLimit.throttledUntil,
    rpmLimit: rpmLimit || null,
    tpmLimit: tpmLimit || null,
  });
}
