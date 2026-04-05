export function providerGatewayKey(provider) {
  const name = provider?.name || "";
  if (name.startsWith("openrouter-")) return "openrouter";
  if (name.startsWith("github-models-")) return "github-models";
  if (name.startsWith("ollama-")) return "ollama";
  if (name.startsWith("groq-")) return "groq";
  if (name.startsWith("mistral-")) return "mistral";
  if (name.startsWith("huggingface-")) return "huggingface";
  if (name.startsWith("together-")) return "together";
  if (name.startsWith("sambanova-")) return "sambanova";
  if (name.startsWith("cerebras-")) return "cerebras";
  if (name.startsWith("fireworks-")) return "fireworks";
  if (name.startsWith("gemini")) return "gemini";
  return provider?.catalogCacheKey || provider?.driver || provider?.baseUrl || name || "unknown";
}
