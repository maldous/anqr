// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:379

import { getOrCreateState } from "./get-or-create-state.mjs";

export function getEffectiveMaxTokens(providerName) {
  const state = getOrCreateState(providerName);
  return state.dynamicMaxTokens;
}
