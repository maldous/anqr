import { getAdUnitId, isTestMode, rewardedPrepareKey, type RewardedType } from './admob-config';
import { rewardedLog as log } from './rewarded-log';
export { showRewardedAdInternal } from './show-rewarded-ad-internal';

export async function prepareRewardedAdInternal(
  adMobAvailable: boolean,
  AdMob: any,
  preparedRewardedKeys: Set<string>,
  type: RewardedType = 'rewarded'
): Promise<boolean> {
  if (!(adMobAvailable && AdMob)) return false;
  try {
    const key = rewardedPrepareKey(type);
    const context =
      type === 'premium' ? 'premium' : type === 'rewardedInterstitial' ? undefined : 'export_hd';
    const adId =
      type === 'rewardedInterstitial'
        ? getAdUnitId('rewardedInterstitial')
        : getAdUnitId('rewarded', context);
    if (type === 'rewardedInterstitial') await AdMob.prepareRewardedInterstitialAd({ adId });
    else await AdMob.prepareRewardedAd({ adId });
    preparedRewardedKeys.add(key);
    log.info('Rewarded ad prepared', { type, mode: isTestMode ? 'TEST' : 'PROD' });
    return true;
  } catch (err) {
    preparedRewardedKeys.delete(rewardedPrepareKey(type));
    log.error('Failed to prepare rewarded ad', { type, error: err });
    return false;
  }
}
