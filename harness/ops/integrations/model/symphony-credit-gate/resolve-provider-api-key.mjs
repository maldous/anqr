export async function resolveProviderApiKey(provider) {
  let apiKey = provider.envVar ? process.env[provider.envVar] : null;
  if (!apiKey && provider.loadToken) {
    apiKey = await provider.loadToken();
  }
  return apiKey;
}
