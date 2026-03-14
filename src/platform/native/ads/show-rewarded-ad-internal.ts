import { rewardedPrepareKey, type RewardedType } from './admob-config';
import { rewardedLog as log } from './rewarded-log';

export async function showRewardedAdInternal(
  adMobAvailable: boolean,
  AdMob: any,
  preparedRewardedKeys: Set<string>,
  prepareRewardedAd: (type: RewardedType) => Promise<boolean>,
  type: RewardedType = 'rewarded'
): Promise<{ rewarded: boolean; amount?: number; type?: string }> {
  if (!(adMobAvailable && AdMob)) return { rewarded: false };
  const key = rewardedPrepareKey(type);
  try {
    if (!preparedRewardedKeys.has(key)) {
      const prepared = await prepareRewardedAd(type);
      if (!prepared) {
        log.warn('Rewarded ad not ready and prepare failed', { type });
        return { rewarded: false };
      }
    }
    const result =
      type === 'rewardedInterstitial'
        ? await AdMob.showRewardedInterstitialAd()
        : await AdMob.showRewardedAd();
    preparedRewardedKeys.delete(key);
    void prepareRewardedAd(type);
    log.info('Rewarded ad shown', { type, reward: result });
    return { rewarded: true, amount: result?.amount, type: result?.type };
  } catch (err) {
    preparedRewardedKeys.delete(key);
    log.error('Failed to show rewarded ad', { type, error: err });
    return { rewarded: false };
  }
}
