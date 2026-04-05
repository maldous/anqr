import { KNOWN_TOOL_CAPABLE } from "../symphony-openai-bridge/known-tool-capable.mjs";

import { probeProviderDetailed } from "./probe-provider-detailed.mjs";
import { toolProbeForProvider } from "./tool-probe-for-provider.mjs";
import { shouldSkipToolProbeForResult } from "./should-skip-tool-probe-for-result.mjs";
import { makeSkippedToolProbeResult } from "./make-skipped-tool-probe-result.mjs";

export async function providerProbeResultsWithProgress(providers, progress) {
  const results = [];
  for (const provider of providers) {
    progress?.({
      type: "provider_started",
      providerName: provider.name,
      toolCapable: KNOWN_TOOL_CAPABLE.has(provider.name),
    });
    const result = await probeProviderDetailed(provider, { progress });
    progress?.({
      type: "provider_finished",
      providerName: provider.name,
      status: result.status,
      reason: result.reason,
      durationMs: result.durationMs,
    });
    let toolProbe;
    if (shouldSkipToolProbeForResult(result)) {
      toolProbe = makeSkippedToolProbeResult(provider, result);
      progress?.({
        type: "tool_probe_skipped",
        providerName: provider.name,
        status: toolProbe.toolStatus,
        reason: toolProbe.reason,
      });
    } else {
      progress?.({ type: "tool_probe_started", providerName: provider.name });
      toolProbe = await toolProbeForProvider(provider, result);
      progress?.({
        type: "tool_probe_finished",
        providerName: provider.name,
        status: toolProbe.toolStatus || toolProbe.status,
        reason: toolProbe.reason || toolProbe.status,
      });
    }
    results.push({ ...result, toolProbe });
  }
  return results;
}
