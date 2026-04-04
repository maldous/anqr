// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:497

import { providerStates } from "./provider-states.mjs";

export function getThrottledProviders() {
  const now = Date.now();
  const throttled = [];
  for (const [name, state] of providerStates) {
    if (state.rateLimit.throttledUntil && now < state.rateLimit.throttledUntil) {
      throttled.push(name);
    }
  }
  return throttled;
}
