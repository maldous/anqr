import { PREFERRED_PROVIDER_ORDER } from "./preferred-provider-order.mjs";
import { PROVIDERS } from "./providers.mjs";
import { getRankedProviders } from "./get-ranked-providers.mjs";

export function buildProviderSelectionCandidateNames() {
  const ordered = [];
  const seen = new Set();
  for (const name of PREFERRED_PROVIDER_ORDER) {
    if (!seen.has(name)) {
      seen.add(name);
      ordered.push(name);
    }
  }
  for (const ranked of getRankedProviders()) {
    if (!seen.has(ranked.name)) {
      seen.add(ranked.name);
      ordered.push(ranked.name);
    }
  }
  for (const provider of PROVIDERS) {
    if (!seen.has(provider.name)) {
      seen.add(provider.name);
      ordered.push(provider.name);
    }
  }
  return ordered;
}
