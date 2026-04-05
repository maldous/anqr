import { buildDynamicOpenrouterLimits } from "./build-dynamic-openrouter-limits.mjs";
import { STATIC_PROVIDER_MAX_INPUT_TOKENS } from "./static-provider-max-input-tokens.mjs";

export function buildProviderMaxInputTokens() {
  const dynamicOpenrouterLimits = buildDynamicOpenrouterLimits();
  return {
    ...STATIC_PROVIDER_MAX_INPUT_TOKENS,
    ...dynamicOpenrouterLimits,
    "openrouter-free": dynamicOpenrouterLimits["openrouter-free"] || 24_000,
  };
}
