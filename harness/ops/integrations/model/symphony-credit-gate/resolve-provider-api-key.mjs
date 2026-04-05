export async function resolveProviderApiKey(provider) {
  if (provider?.driver === "codex-sdk") {
    return process.env.OPENAI_API_KEY || null;
  }
  let apiKey = provider?.envVar ? process.env[provider.envVar] : null;
  if (!apiKey && provider?.loadToken) {
    apiKey = await provider.loadToken();
  }
  return apiKey;
}
