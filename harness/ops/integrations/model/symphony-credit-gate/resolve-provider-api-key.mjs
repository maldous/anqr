export async function resolveProviderApiKey(provider) {
  let apiKey = provider.envVar ? process.env[provider.envVar] : null;
  if (!apiKey && provider.driver === "codex-sdk") {
    apiKey = process.env.OPENAI_API_KEY || null;
  }
  if (!apiKey && provider.loadToken) {
    apiKey = await provider.loadToken();
  }
  return apiKey;
}
