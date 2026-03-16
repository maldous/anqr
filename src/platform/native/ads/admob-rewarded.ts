import { getAdUnitId, isTestMode, rewardedPrepareKey, type RewardedType } from "./admob-config";
import { rewardedLog as log } from "./rewarded-log";
export { showRewardedAdInternal } from "./show-rewarded-ad-internal";

export async function prepareRewardedAdInternal(
  adMobAvailable: boolean,
  AdMob: unknown,
  preparedRewardedKeys: Set<string>,
  type: RewardedType = "rewarded",
): Promise<boolean> {
  if (!(adMobAvailable && AdMob)) return false;
  const adMob = AdMob as {
    prepareRewardedInterstitialAd(o: { adId: string }): Promise<void>;
    prepareRewardedAd(o: { adId: string }): Promise<void>;
  };
  try {
    const key = rewardedPrepareKey(type);
    const context =
      type === "premium" ? "premium" : type === "rewardedInterstitial" ? undefined : "export_hd";
    const adId =
      type === "rewardedInterstitial"
        ? getAdUnitId("rewardedInterstitial")
        : getAdUnitId("rewarded", context);
    if (type === "rewardedInterstitial") await adMob.prepareRewardedInterstitialAd({ adId });
    else await adMob.prepareRewardedAd({ adId });
    preparedRewardedKeys.add(key);
    log.info("Rewarded ad prepared", { type, mode: isTestMode ? "TEST" : "PROD" });
    return true;
  } catch (err) {
    preparedRewardedKeys.delete(rewardedPrepareKey(type));
    log.error("Failed to prepare rewarded ad", { type, error: err });
    return false;
  }
}
