// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:569

import { getRequestsPerMinute } from "./get-requests-per-minute.mjs";
import { getTokensPerMinute } from "./get-tokens-per-minute.mjs";
import { isProviderThrottled } from "./is-provider-throttled.mjs";
import { providerStates } from "./provider-states.mjs";

export function getAdaptiveStats() {
  const stats = {};
  for (const [name, state] of providerStates) {
    const isThrottled = isProviderThrottled(name);
    stats[name] = {
      baseMaxTokens: state.baseMaxTokens,
      dynamicMaxTokens: state.dynamicMaxTokens,
      dynamicVsBase:
        state.dynamicMaxTokens < state.baseMaxTokens
          ? `${Math.round((state.dynamicMaxTokens / state.baseMaxTokens) * 100)}%`
          : "100%",
      consecutiveContextErrors: state.consecutiveContextErrors,
      consecutiveContextSuccesses: state.consecutiveContextSuccesses,
      lastContextErrorAt: state.lastContextErrorAt,
      lastContextSuccessAt: state.lastContextSuccessAt,
      throttled: isThrottled,
      throttledUntil: state.rateLimit.throttledUntil,
      tpmLimit: state.rateLimit.tpmLimit,
      rpmLimit: state.rateLimit.rpmLimit,
      currentTPM: getTokensPerMinute(name),
      currentRPM: getRequestsPerMinute(name),
      errorCounts: { ...state.errorCounts },
    };
  }
  return stats;
}
