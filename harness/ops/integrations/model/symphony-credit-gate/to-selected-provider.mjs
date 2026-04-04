import { PROJECT_ROOT } from "./project-root.mjs";
import { getProviderTier } from "./get-provider-tier.mjs";

export function toSelectedProvider(provider, apiKey) {
  return {
    name: provider.name,
    model: provider.model,
    baseUrl: provider.baseUrl,
    apiKey: apiKey || null,
    requiresSdk: provider.requiresSdk || false,
    driver: provider.driver || null,
    cwd: provider.requiresSdk ? PROJECT_ROOT : undefined,
    useMaxCompletionTokens: provider.useMaxCompletionTokens || false,
    tier: getProviderTier(provider),
  };
}
