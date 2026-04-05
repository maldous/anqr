import { isProviderCurrentPoolHealthy } from "./is-provider-current-pool-healthy.mjs";

export function buildProviderProbeSummary(results) {
  const healthy = results.filter(isProviderCurrentPoolHealthy).length;
  const degraded = results.filter(
    (result) =>
      !isProviderCurrentPoolHealthy(result) &&
      (["success", "degraded"].includes(result.status) ||
        result.routeInfo?.isBridgeBlocked ||
        result.toolProbe?.toolStatus === "inconclusive" ||
        result.toolProbe?.toolStatus === "non_capable"),
  ).length;
  return {
    total: results.length,
    healthy,
    degraded,
    failed: results.length - healthy - degraded,
    bridgeBlocked: results.filter((result) => result.routeInfo.isBridgeBlocked).length,
  };
}
