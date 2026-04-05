import { recordProviderHealthSuccess } from "../symphony-provider-health.mjs";

import { loadStats } from "./load-stats.mjs";
import { providerGatewayKey } from "./provider-gateway-key.mjs";
import { saveStats } from "./save-stats.mjs";

export function recordProviderSuccess(providerName) {
  const stats = loadStats();
  stats.successes[providerName] = (stats.successes[providerName] || 0) + 1;
  stats.lastSuccess[providerName] = Date.now();
  saveStats(stats);
  recordProviderHealthSuccess(providerName);
  const gatewayKey = providerGatewayKey({ name: providerName });
  if (gatewayKey !== providerName) recordProviderHealthSuccess(gatewayKey);
}
