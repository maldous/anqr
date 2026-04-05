export function getProviderPreferenceBoost(providerName) {
  if (providerName === "codex") return 0.22;
  if (providerName === "codebuff") return 0.18;
  return 0;
}
