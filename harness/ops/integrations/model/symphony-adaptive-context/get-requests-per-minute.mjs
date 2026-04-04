// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:537

import { providerStates } from "./provider-states.mjs";
import { pruneRequestEvents } from "./prune-request-events.mjs";

export function getRequestsPerMinute(providerName) {
  if (!providerStates.has(providerName)) return 0;
  const state = providerStates.get(providerName);
  pruneRequestEvents(state);
  return state.requestEvents.length;
}
