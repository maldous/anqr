import { TIER_FREE_CLOUD } from "./tier-free-cloud.mjs";
import { getProviderTier } from "./get-provider-tier.mjs";

export function getEffectiveProviderTier(provider, probeEntry) {
  if (
    provider?.name === "codebuff" &&
    probeEntry?.status === "degraded" &&
    probeEntry?.mode === "free"
  ) {
    return TIER_FREE_CLOUD;
  }
  return getProviderTier(provider);
}
