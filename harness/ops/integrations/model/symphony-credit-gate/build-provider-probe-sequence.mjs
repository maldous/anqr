import { getRankedProviders } from "./get-ranked-providers.mjs";

export function buildProviderProbeSequence() {
  return getRankedProviders({ includeAvailable: true }).map((entry) => ({
    name: entry.name,
    source: "ranked",
  }));
}
