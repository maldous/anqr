import { getActiveProviderLeases } from "./get-active-provider-leases.mjs";
import { getProviderLeaseOwner } from "./get-provider-lease-owner.mjs";
import { getProviderModelKey } from "./get-provider-model-key.mjs";
import { isProviderLeaseExempt } from "./is-provider-lease-exempt.mjs";
import { providerGatewayKey } from "./provider-gateway-key.mjs";
import { saveProviderLeases } from "./save-provider-leases.mjs";

export function releaseProviderLease(provider) {
  if (isProviderLeaseExempt(provider)) return;
  const owner = getProviderLeaseOwner();
  const familyKey = providerGatewayKey(provider);
  const modelKey = getProviderModelKey(provider);
  const leases = getActiveProviderLeases().filter(
    (lease) =>
      !(lease.owner === owner && lease.familyKey === familyKey && lease.modelKey === modelKey),
  );
  saveProviderLeases(leases);
}
