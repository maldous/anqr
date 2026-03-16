import { pickProdAdUnitId } from "./pick-prod-ad-unit-id";
import { PROD_AD_UNIT_IDS } from "./prod-ad-unit-ids";
import { TEST_AD_UNIT_IDS } from "./test-ad-unit-ids";

export const isTestMode = import.meta.env.VITE_ADMOB_TESTING === "true";
export type { InterstitialType } from "./interstitial-type";
export type { RewardedType } from "./rewarded-type";

export function getAdUnitId(
  type: "banner" | "interstitial" | "rewarded" | "rewardedInterstitial",
  context?: string,
): string {
  if (isTestMode) return TEST_AD_UNIT_IDS[type];
  switch (type) {
    case "banner":
      return pickProdAdUnitId(
        type,
        context === "top" ? PROD_AD_UNIT_IDS.bannerTop : PROD_AD_UNIT_IDS.bannerBottom,
      );
    case "interstitial":
      if (context === "export") return pickProdAdUnitId(type, PROD_AD_UNIT_IDS.interstitialExport);
      if (context === "gallery")
        return pickProdAdUnitId(type, PROD_AD_UNIT_IDS.interstitialGallery);
      return pickProdAdUnitId(type, PROD_AD_UNIT_IDS.interstitialGeneration);
    case "rewarded":
      return pickProdAdUnitId(
        type,
        context === "export_hd"
          ? PROD_AD_UNIT_IDS.rewardedExportHd
          : PROD_AD_UNIT_IDS.rewardedPremium,
      );
    case "rewardedInterstitial":
      return pickProdAdUnitId(type, PROD_AD_UNIT_IDS.rewardedPremium);
    default:
      return TEST_AD_UNIT_IDS[type];
  }
}

export { interstitialPrepareKey } from "./interstitial-prepare-key";
export { rewardedPrepareKey } from "./rewarded-prepare-key";
