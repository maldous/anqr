import { createLogger } from "../../../infra/logging/logger";
import { TEST_AD_UNIT_IDS } from "./test-ad-unit-ids";

const log = createLogger("ADMOB");

export function pickProdAdUnitId(
  type: "banner" | "interstitial" | "rewarded" | "rewardedInterstitial",
  candidate: string | undefined,
): string {
  const trimmed = (candidate ?? "").trim();
  if (trimmed) return trimmed;
  log.warn("Missing production ad unit ID; falling back to Google test ID", { type });
  return TEST_AD_UNIT_IDS[type];
}
