import { getOrCreateState } from "./get-or-create-state.mjs";

export function getEffectiveMaxTokens(providerName) {
  const state = getOrCreateState(providerName);
  return state.dynamicMaxTokens;
}
