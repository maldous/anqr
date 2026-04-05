export function isPreferredPaidProviderEligible(providerName, probeEntry) {
  if (providerName !== "codebuff") return true;
  return !(probeEntry?.status === "degraded" && probeEntry?.mode === "free");
}
