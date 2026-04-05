export function providerGatewayKey(provider) {
  if (provider?.name?.startsWith("openrouter-")) return "openrouter";
  if (provider?.name?.startsWith("github-models-")) return "github-models";
  if (provider?.name?.startsWith("ollama-")) return "ollama";
  return (
    provider?.catalogCacheKey ||
    provider?.driver ||
    provider?.baseUrl ||
    provider?.name ||
    "unknown"
  );
}
