// Generated from ../../../../scripts/ops/integrations/model/symphony-provider-health.mjs:169

import { loadHealthState } from "./load-health-state.mjs";

export function getAllProviderHealthStates() {
  return loadHealthState();
}
