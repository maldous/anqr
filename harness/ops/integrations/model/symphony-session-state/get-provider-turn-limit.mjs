import { getAdaptiveParams } from "./get-adaptive-params.mjs";

export function getProviderTurnLimit(providerName) {
  const params = getAdaptiveParams();
  return params.freeTurnLimit.perProvider[providerName] || params.freeTurnLimit.base;
}
