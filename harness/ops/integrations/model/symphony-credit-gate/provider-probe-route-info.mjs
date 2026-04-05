import { BRIDGE_PROVIDER_BLOCKLIST } from "../symphony-openai-bridge/bridge-provider-blocklist.mjs";
import { BRIDGE_PROVIDER_BLOCKLIST_REASONS } from "../symphony-openai-bridge/bridge-provider-blocklist-reasons.mjs";
import { ADVERTISED_MODELS } from "../symphony-openai-bridge/advertised-models.mjs";
import { KNOWN_TOOL_CAPABLE } from "../symphony-openai-bridge/known-tool-capable.mjs";

export function providerProbeRouteInfo(provider) {
  const baseName = provider?.baseProviderName || provider?.name;
  const advertised = ADVERTISED_MODELS.filter(
    (entry) =>
      entry.allowedNames?.includes(provider?.name) || entry.allowedNames?.includes(baseName),
  );
  const isBridgeBlocked =
    BRIDGE_PROVIDER_BLOCKLIST.has(provider?.name) || BRIDGE_PROVIDER_BLOCKLIST.has(baseName);
  return {
    advertisedRouteIds: advertised.map((entry) => entry.id),
    isBridgeBlocked,
    bridgeBlockReason: isBridgeBlocked
      ? BRIDGE_PROVIDER_BLOCKLIST_REASONS[provider?.name] ||
        BRIDGE_PROVIDER_BLOCKLIST_REASONS[baseName] ||
        null
      : null,
    knownToolCapable: KNOWN_TOOL_CAPABLE.has(provider?.name) || KNOWN_TOOL_CAPABLE.has(baseName),
  };
}
