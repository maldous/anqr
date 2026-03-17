import type { InterstitialDeps } from "./interstitial-deps.types";
import { interstitialPrepareKey, type InterstitialType } from "./admob-config";
import { interstitialLog as log } from "./interstitial-log";
import { prepareInterstitialInternal } from "./prepare-interstitial-internal";

export async function showInterstitialInternal(
  deps: InterstitialDeps,
  type: InterstitialType = "interstitial",
): Promise<boolean> {
  if (!(deps.adMobAvailable && deps.AdMob)) return false;
  const key = interstitialPrepareKey(type);
  try {
    if (!deps.preparedInterstitialKeys.has(key)) {
      const prepared = await prepareInterstitialInternal(deps, type);
      if (!prepared) {
        deps.log.warn("Interstitial not ready and prepare failed", { type });
        return false;
      }
    }
    if (type === "rewardedInterstitial") {
      const result = await deps.AdMob.showRewardedInterstitialAd();
      deps.log.info("Rewarded interstitial shown", { reward: result });
    } else {
      await deps.AdMob.showInterstitial();
      log.info("Interstitial shown");
    }
    deps.preparedInterstitialKeys.delete(key);
    void prepareInterstitialInternal(deps, type);
    return true;
  } catch (error) {
    deps.preparedInterstitialKeys.delete(key);
    deps.log.error("Failed to show ad", { type, error });
    return false;
  }
}
