import { providerGatewayKey } from "./provider-gateway-key.mjs";
import { providerProbeStage } from "./provider-probe-stage.mjs";
import { providerProbeBridgeRoute } from "./provider-probe-bridge-route.mjs";
import { providerProbeDirectStatus } from "./provider-probe-direct-status.mjs";
import { providerProbeRouteInfo } from "./provider-probe-route-info.mjs";
import { probeProviderDetailed } from "./probe-provider-detailed.mjs";
import { resolveProviderApiKey } from "./resolve-provider-api-key.mjs";
import { isTransientProviderFailureType } from "./is-transient-provider-failure-type.mjs";

export async function buildProviderProbeResultForProvider(provider, gatewayCooldowns) {
  const gateway = providerGatewayKey(provider);
  const cooldown = gatewayCooldowns.get(gateway);
  if (cooldown) {
    const result = {
      providerName: provider.name,
      model: provider.model,
      driver: provider.driver || "openai-compatible",
      tier: provider.tier || "free-cloud",
      envVar: provider.envVar || null,
      hasCredential: Boolean(await resolveProviderApiKey(provider)),
      routeInfo: providerProbeRouteInfo(provider),
      available: false,
      status: "cooling_down",
      reason: `skipped due to gateway cooldown after ${cooldown.status}`,
      durationMs: 0,
      message: cooldown.reason,
      stages: [providerProbeStage("gateway_cooldown", { gateway, reason: cooldown.reason })],
    };
    return {
      ...result,
      bridgeRoute: providerProbeBridgeRoute(result),
      ...providerProbeDirectStatus(result),
    };
  }
  const result = await probeProviderDetailed(provider);
  if (isTransientProviderFailureType(result.status)) {
    gatewayCooldowns.set(gateway, { status: result.status, reason: result.reason });
  }
  return result;
}
