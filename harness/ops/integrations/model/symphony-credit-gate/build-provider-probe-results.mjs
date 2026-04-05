import { PROVIDERS } from "./providers.mjs";
import { makeProviderProbeProgressCallback } from "./make-provider-probe-progress-callback.mjs";
import { providerProbeResultsWithProgress } from "./provider-probe-results-with-progress.mjs";
import { shuffleProviderProbeOrder } from "./shuffle-provider-probe-order.mjs";

export async function buildProviderProbeResults() {
  const orderedProviders = shuffleProviderProbeOrder(PROVIDERS);
  const providerIndex = new Map(
    orderedProviders.map((provider, index) => [provider.name, index + 1]),
  );
  const progress = makeProviderProbeProgressCallback({
    total: orderedProviders.length,
    providerIndex,
  });
  return providerProbeResultsWithProgress(orderedProviders, progress);
}
