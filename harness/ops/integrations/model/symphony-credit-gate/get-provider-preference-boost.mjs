export function getProviderPreferenceBoost(providerName, cachedProbe) {
  if (providerName === "codex") return 0.18;
  if (providerName === "codebuff") {
    return cachedProbe?.mode === "free" ? 0.02 : 0.14;
  }
  return 0;
}
