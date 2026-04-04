// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:1406

import { getProviderHealthState } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";

export function getAllProviderHealthStates() {
  const states = {};
  for (const provider of PROVIDERS) {
    states[provider.name] = getProviderHealthState(provider.name);
  }
  return states;
}
