export function buildProviderProbeSummary(results) {
  return {
    total: results.length,
    healthy: results.filter(
      (result) =>
        ["success", "degraded"].includes(result.status) &&
        result.bridgeRoute?.status === "advertised" &&
        result.toolProbe?.toolStatus === "capable",
    ).length,
    degraded: results.filter(
      (result) =>
        ["success", "degraded"].includes(result.status) &&
        !(
          result.bridgeRoute?.status === "advertised" && result.toolProbe?.toolStatus === "capable"
        ),
    ).length,
    failed: results.filter((result) => !["success", "degraded"].includes(result.status)).length,
    bridgeBlocked: results.filter((result) => result.routeInfo.isBridgeBlocked).length,
  };
}
