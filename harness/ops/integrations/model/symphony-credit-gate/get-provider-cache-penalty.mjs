export function getProviderCachePenalty(cachedProbe) {
  if (!cachedProbe) return 0;
  if (cachedProbe.status === "rate_limited") return 0.03;
  if (cachedProbe.status === "provider_error") return 0.04;
  if (cachedProbe.status === "quota_exhausted") return 0.06;
  if (cachedProbe.status === "cooling_down") return 0.04;
  return 0;
}
