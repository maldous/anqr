import { KNOWN_TOOL_CAPABLE } from "../symphony-openai-bridge/known-tool-capable.mjs";
import { providerToolSupportHint } from "../symphony-openai-bridge/provider-tool-support-hint.mjs";

import { buildProviderProbeResultForProvider } from "./build-provider-probe-result-for-provider.mjs";
import { buildProviderProbeToolProbe } from "./build-provider-probe-tool-probe.mjs";

export async function providerProbeResultsWithProgress(providers, progress) {
  const gatewayCooldowns = new Map();
  const results = [];
  for (const provider of providers) {
    const toolSupportHint = providerToolSupportHint(provider);
    progress?.({
      type: "provider_started",
      providerName: provider.name,
      toolCapable: KNOWN_TOOL_CAPABLE.has(provider.name),
      toolSupportHint: toolSupportHint.status,
      detail: toolSupportHint.reason,
    });
    const result = await buildProviderProbeResultForProvider(provider, gatewayCooldowns);
    progress?.({
      type: "provider_finished",
      providerName: provider.name,
      status: result.status,
      reason: result.reason,
      detail: result.message || result.reason,
      durationMs: result.durationMs,
    });
    const toolProbe = await buildProviderProbeToolProbe(provider, result);
    progress?.({
      type: toolProbe.status === "skipped" ? "tool_probe_skipped" : "tool_probe_finished",
      providerName: provider.name,
      status: toolProbe.toolStatus || toolProbe.status,
      reason: toolProbe.reason || toolProbe.status,
      detail: toolProbe.detail || toolProbe.reason || toolProbe.status,
      answer: toolProbe.answer || "",
    });
    results.push({ ...result, toolProbe });
  }
  return results;
}
