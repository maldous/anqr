export function providerProbeBridgeRoute(result) {
  if (result.routeInfo.isBridgeBlocked) {
    return { status: "blocked", reason: result.routeInfo.bridgeBlockReason || "bridge blocked" };
  }
  if (result.routeInfo.advertisedRouteIds.length === 0) {
    return { status: "not_advertised", reason: "provider has no advertised bridge route" };
  }
  return {
    status: "advertised",
    reason: `routes: ${result.routeInfo.advertisedRouteIds.join(", ")}`,
  };
}
