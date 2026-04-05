export function buildProviderProbeSummary(results) {
  return {
    total: results.length,
    healthy: results.filter((result) => result.status === 'success').length,
    degraded: results.filter((result) => result.status === 'degraded').length,
    failed: results.filter((result) => !['success', 'degraded'].includes(result.status)).length,
    bridgeBlocked: results.filter((result) => result.routeInfo.isBridgeBlocked).length,
  };
}
