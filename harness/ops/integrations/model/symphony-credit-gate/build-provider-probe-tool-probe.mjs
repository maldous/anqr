import { makeSkippedToolProbeResult } from "./make-skipped-tool-probe-result.mjs";
import { shouldSkipToolProbeForResult } from "./should-skip-tool-probe-for-result.mjs";
import { toolProbeForProvider } from "./tool-probe-for-provider.mjs";

export async function buildProviderProbeToolProbe(provider, result) {
  if (shouldSkipToolProbeForResult(result)) {
    return makeSkippedToolProbeResult(provider, result);
  }
  return toolProbeForProvider(provider);
}
