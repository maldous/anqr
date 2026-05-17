export function hasConfiguredCredentials(provider) {
  if (provider?.driver === "codex-sdk") {
    return Boolean(process.env.OPENAI_API_KEY);
  }
  if (!provider?.envVar) {
    return typeof provider?.loadToken === "function" || true;
  }
  const value = process.env[provider.envVar];
  return Boolean((value && value !== "REPLACE" && value.length > 1) || provider?.loadToken);
}
