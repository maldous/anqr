import { probeToolCapabilityForProvider } from "../symphony-openai-bridge/probe-tool-capability-for-provider.mjs";

import { providerProbeToolReason } from "./provider-probe-tool-reason.mjs";
import { providerProbeToolStatus } from "./provider-probe-tool-status.mjs";

export async function buildProviderProbeToolProbe(provider, result) {
  let raw;
  if (result.available || result.status === "degraded" || result.routeInfo?.knownToolCapable) {
    if (["success", "degraded"].includes(result.status) || result.routeInfo?.knownToolCapable) {
      raw = await probeToolCapabilityForProvider(provider);
    }
  }
  if (!raw) {
    raw = {
      name: provider.name,
      status: "skipped",
      reason: "skipped-after-access-failure",
      detail: result.reason,
    };
  }
  return {
    ...raw,
    toolStatus: providerProbeToolStatus(raw),
    reason: providerProbeToolReason(raw),
    detail: raw?.detail || raw?.answer || raw?.reason || raw?.status || "unknown",
  };
}
