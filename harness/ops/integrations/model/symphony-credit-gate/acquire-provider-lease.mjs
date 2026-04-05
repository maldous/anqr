import { getActiveProviderLeases } from "./get-active-provider-leases.mjs";
import { getProviderLeaseOwner } from "./get-provider-lease-owner.mjs";
import { getProviderModelKey } from "./get-provider-model-key.mjs";
import { isProviderLeaseExempt } from "./is-provider-lease-exempt.mjs";
import { PROVIDER_LEASE_TTL_MS } from "./provider-lease-ttl-ms.mjs";
import { providerGatewayKey } from "./provider-gateway-key.mjs";
import { saveProviderLeases } from "./save-provider-leases.mjs";

export function acquireProviderLease(provider) {
  if (isProviderLeaseExempt(provider)) return null;
  const owner = getProviderLeaseOwner();
  const familyKey = providerGatewayKey(provider);
  const modelKey = getProviderModelKey(provider);
  const now = Date.now();
  const leases = getActiveProviderLeases().filter(
    (lease) =>
      !(lease.owner === owner && (lease.familyKey === familyKey || lease.modelKey === modelKey)),
  );
  const lease = {
    owner,
    providerName: provider?.name || familyKey,
    familyKey,
    modelKey,
    acquiredAt: now,
    expiresAt: now + PROVIDER_LEASE_TTL_MS,
  };
  leases.push(lease);
  saveProviderLeases(leases);
  return lease;
}
