// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:447

import { getAdaptiveParams } from "./get-adaptive-params.mjs";

export function getProviderTurnLimit(providerName) {
  const params = getAdaptiveParams();
  return params.freeTurnLimit.perProvider[providerName] || params.freeTurnLimit.base;
}
