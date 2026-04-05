import { PROVIDERS } from "./providers.mjs";
import { PREFERRED_PROVIDER_ORDER } from "./preferred-provider-order.mjs";
import { getRankedProviders } from "./get-ranked-providers.mjs";

export function buildProviderProbeSequence() {
  const sequence = [];
  const seen = new Set();
  const pushName = (name, source) => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    sequence.push({ name, source });
  };
  for (const name of PREFERRED_PROVIDER_ORDER) pushName(name, "preferred");
  for (const ranked of getRankedProviders()) pushName(ranked.name, "ranked");
  for (const provider of PROVIDERS) pushName(provider.name, "fallback");
  return sequence;
}
