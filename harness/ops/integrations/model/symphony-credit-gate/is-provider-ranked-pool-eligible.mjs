import { isNeverPurchasedCredits } from "./is-never-purchased-credits.mjs";

export function isProviderRankedPoolEligible(result) {
  if (!result) return false;
  if (result.routeInfo?.isBridgeBlocked) return false;
  if (result.bridgeRoute?.status !== "advertised") return false;
  if (["auth_missing", "auth_invalid"].includes(result.status)) return false;
  if (isNeverPurchasedCredits(result)) return false;
  if (result.toolProbe?.toolStatus === "non_capable") return false;
  if (result.routeInfo?.knownToolCapable) return true;
  return ["capable", "inconclusive", "not_probed"].includes(
    result.toolProbe?.toolStatus || "not_probed",
  );
}
