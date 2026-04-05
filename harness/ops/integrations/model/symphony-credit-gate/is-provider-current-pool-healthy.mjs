export function isProviderCurrentPoolHealthy(result) {
  return Boolean(
    result &&
    ["success", "degraded"].includes(result.status) &&
    result.bridgeRoute?.status === "advertised" &&
    result.toolProbe?.toolStatus === "capable",
  );
}
