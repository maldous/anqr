export function buildFallbackBridgeRoute(routeInfo) {
  if (routeInfo?.isBridgeBlocked) {
    return { status: "blocked", reason: "bridge blocked" };
  }
  if (routeInfo?.advertisedRouteIds?.length) {
    return { status: "advertised", reason: routeInfo.advertisedRouteIds.join(", ") || "advertised" };
  }
  return { status: "not_advertised", reason: "not advertised" };
}
