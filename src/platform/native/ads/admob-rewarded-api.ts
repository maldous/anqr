import { type RewardedType } from './admob-config';
import { prepareRewardedAdInternal } from './admob-rewarded';
import { admobRuntime } from './admob-runtime-state';
export { isRewardedAdReady } from './rewarded-ad-ready';

export async function prepareRewardedAd(type: RewardedType = 'rewarded'): Promise<boolean> {
  return prepareRewardedAdInternal(
    admobRuntime.available,
    admobRuntime.AdMob,
    admobRuntime.preparedRewardedKeys,
    type
  );
}
