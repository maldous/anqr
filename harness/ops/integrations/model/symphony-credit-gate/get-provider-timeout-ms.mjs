// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:1397

import { getProviderTimeout } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";

export function getProviderTimeoutMs(providerName) {
  const provider = PROVIDERS.find((p) => p.name === providerName);
  return getProviderTimeout(providerName, provider?.baseUrl || "");
}
