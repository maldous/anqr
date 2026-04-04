// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:148

import { TIER_FREE_CLOUD } from "./tier-free-cloud.mjs";

export function getProviderTier(provider) {
  return provider.tier || TIER_FREE_CLOUD;
}
