import { loadProviderLeases } from "./load-provider-leases.mjs";
import { pruneProviderLeases } from "./prune-provider-leases.mjs";
import { saveProviderLeases } from "./save-provider-leases.mjs";

export function getActiveProviderLeases() {
  const loaded = loadProviderLeases();
  const active = pruneProviderLeases(loaded);
  if (active.length !== loaded.length) saveProviderLeases(active);
  return active;
}
