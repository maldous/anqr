// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:106

import { createProviderState } from "./create-provider-state.mjs";
import { providerStates } from "./provider-states.mjs";

export function getOrCreateState(providerName) {
  if (!providerStates.has(providerName)) {
    providerStates.set(providerName, createProviderState(providerName));
  }
  return providerStates.get(providerName);
}
