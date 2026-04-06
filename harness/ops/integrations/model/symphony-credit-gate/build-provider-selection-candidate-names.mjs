import { getRankedProviders } from "./get-ranked-providers.mjs";

export function buildProviderSelectionCandidateNames(options = {}) {
  const seen = new Set();
  const ordered = [];

  for (const ranked of getRankedProviders({ includeAvailable: true, ...options })) {
    if (!ranked?.name || seen.has(ranked.name)) continue;
    seen.add(ranked.name);
    ordered.push(ranked.name);
  }

  return ordered;
}
