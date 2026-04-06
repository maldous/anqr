import { getProviderTier } from "./get-provider-tier.mjs";

export function getEffectiveProviderTier(provider, _probeEntry) {
  return getProviderTier(provider);
}
