import { hasDurableProviderAccessFailure } from "./has-durable-provider-access-failure.mjs";

export function isProviderRankedPoolEligible(result) {
  if (!result) return false;
  if (result.routeInfo?.isBridgeBlocked) return false;
  if (result.bridgeRoute?.status !== "advertised") return false;
  if (["auth_missing", "auth_invalid"].includes(result.status)) return false;
  if (hasDurableProviderAccessFailure(result)) return false;
  if (result.toolProbe?.toolStatus === "non_capable") return false;
  if (result.routeInfo?.knownToolCapable) return true;
  return ["capable", "inconclusive", "not_probed", "skipped"].includes(
    result.toolProbe?.toolStatus || "not_probed",
  );
}
