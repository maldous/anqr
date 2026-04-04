// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:1230

import { PROVIDERS } from "./providers.mjs";
import { getProviderTier } from "./get-provider-tier.mjs";

export function getConfiguredProviders(options = {}) {
  const { excludeNames = [] } = options;
  const excludeSet = new Set(excludeNames);
  const configured = [];

  for (const provider of PROVIDERS) {
    if (excludeSet.has(provider.name)) continue;

    let hasCredential = false;
    if (provider.envVar) {
      const val = process.env[provider.envVar];
      hasCredential = !!val && val !== "REPLACE" && val.length > 1;
      if (!hasCredential && typeof provider.loadToken === "function") {
        hasCredential = true;
      }
    } else if (provider.driver === "codex-sdk") {
      hasCredential = !!process.env.OPENAI_API_KEY;
    } else if (typeof provider.loadToken === "function") {
      hasCredential = true;
    } else {
      hasCredential = true;
    }

    if (hasCredential) {
      let providerType = "api";
      if (provider.requiresSdk || provider.driver === "codex-sdk") {
        providerType = "sdk";
      } else if (
        provider.baseUrl?.includes("127.0.0.1") ||
        provider.baseUrl?.includes("localhost")
      ) {
        providerType = "local";
      }
      configured.push({
        name: provider.name,
        model: provider.model,
        type: providerType,
        tier: getProviderTier(provider),
      });
    }
  }

  return configured;
}
