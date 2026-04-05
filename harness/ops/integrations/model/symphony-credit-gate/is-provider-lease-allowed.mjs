import { getActiveProviderLeases } from "./get-active-provider-leases.mjs";
import { getProviderLeaseOwner } from "./get-provider-lease-owner.mjs";
import { getProviderModelKey } from "./get-provider-model-key.mjs";
import { isProviderLeaseExempt } from "./is-provider-lease-exempt.mjs";
import { providerGatewayKey } from "./provider-gateway-key.mjs";

export function isProviderLeaseAllowed(provider, phase = "shared") {
  if (isProviderLeaseExempt(provider)) return true;
  const owner = getProviderLeaseOwner();
  const familyKey = providerGatewayKey(provider);
  const modelKey = getProviderModelKey(provider);
  const active = getActiveProviderLeases();
  if (phase === "family") {
    return !active.some((lease) => lease.owner !== owner && lease.familyKey === familyKey);
  }
  if (phase === "model") {
    return !active.some((lease) => lease.owner !== owner && lease.modelKey === modelKey);
  }
  return true;
}
