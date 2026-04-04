import { probeToolCapabilityForProvider } from "./probe-tool-capability-for-provider.mjs";
import { sleep } from "./sleep.mjs";
import { logDebug } from "./logger.mjs";

export async function probeGatewayBatched(gatewayName, providers, batchSize, delayMs) {
  const results = [];
  for (let i = 0; i < providers.length; i += batchSize) {
    const batch = providers.slice(i, i + batchSize);
    logDebug(
      `🔧 Gateway ${gatewayName}: batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(providers.length / batchSize)} (${batch.map((p) => p.name).join(", ")})`,
    );
    const batchResults = await Promise.allSettled(
      batch.map((p) => probeToolCapabilityForProvider(p)),
    );
    for (const r of batchResults) {
      if (r.status === "fulfilled") results.push(r.value);
    }
    if (i + batchSize < providers.length) await sleep(delayMs);
  }
  return results;
}
