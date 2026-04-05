import { BRIDGE_PROVIDER_BLOCKLIST } from "../symphony-openai-bridge/bridge-provider-blocklist.mjs";
import { BRIDGE_PROVIDER_BLOCKLIST_REASONS } from "../symphony-openai-bridge/bridge-provider-blocklist-reasons.mjs";
import { ADVERTISED_MODELS } from "../symphony-openai-bridge/advertised-models.mjs";
import { KNOWN_TOOL_CAPABLE } from "../symphony-openai-bridge/known-tool-capable.mjs";

export function providerProbeRouteInfo(provider) {
  const advertised = ADVERTISED_MODELS.filter((entry) =>
    entry.allowedNames?.includes(provider.name),
  );
  const isBridgeBlocked = BRIDGE_PROVIDER_BLOCKLIST.has(provider.name);
  return {
    advertisedRouteIds: advertised.map((entry) => entry.id),
    isBridgeBlocked,
    bridgeBlockReason: isBridgeBlocked
      ? BRIDGE_PROVIDER_BLOCKLIST_REASONS[provider.name] || null
      : null,
    knownToolCapable: KNOWN_TOOL_CAPABLE.has(provider.name),
  };
}
