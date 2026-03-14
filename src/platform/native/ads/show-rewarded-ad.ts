import { type RewardedType } from './admob-config';
import { prepareRewardedAdInternal, showRewardedAdInternal } from './admob-rewarded';
import { admobRuntime } from './admob-runtime-state';

export async function showRewardedAd(
  type: RewardedType = 'rewarded'
): Promise<{ rewarded: boolean; amount?: number; type?: string }> {
  return showRewardedAdInternal(
    admobRuntime.available,
    admobRuntime.AdMob,
    admobRuntime.preparedRewardedKeys,
    (rewardedType) =>
      prepareRewardedAdInternal(
        admobRuntime.available,
        admobRuntime.AdMob,
        admobRuntime.preparedRewardedKeys,
        rewardedType
      ),
    type
  );
}
