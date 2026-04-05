import { probeToolCapabilityForProvider } from "../symphony-openai-bridge/probe-tool-capability-for-provider.mjs";

import { providerProbeToolReason } from "./provider-probe-tool-reason.mjs";
import { providerProbeToolStatus } from "./provider-probe-tool-status.mjs";

export async function toolProbeForProvider(provider) {
  const raw = await probeToolCapabilityForProvider(provider);
  return {
    ...raw,
    toolStatus: providerProbeToolStatus(raw),
    reason: providerProbeToolReason(raw),
    detail: raw?.detail || raw?.answer || raw?.reason || raw?.status || "unknown",
  };
}
