import {
  getAdUnitId,
  interstitialPrepareKey,
  isTestMode,
  type InterstitialType,
} from './admob-config';
import type { InterstitialDeps } from './interstitial-deps.type';

export async function prepareInterstitialInternal(
  deps: InterstitialDeps,
  type: InterstitialType = 'interstitial'
): Promise<boolean> {
  if (!(deps.adMobAvailable && deps.AdMob)) return false;
  try {
    const key = interstitialPrepareKey(type);
    const adId =
      type === 'rewardedInterstitial'
        ? getAdUnitId('rewardedInterstitial')
        : getAdUnitId('interstitial', type);
    if (type === 'rewardedInterstitial') {
      await deps.AdMob.prepareRewardedInterstitialAd({ adId });
    } else {
      await deps.AdMob.prepareInterstitial({ adId });
    }
    deps.preparedInterstitialKeys.add(key);
    deps.log.info('Ad prepared', { type, mode: isTestMode ? 'TEST' : 'PROD' });
    return true;
  } catch (error) {
    deps.preparedInterstitialKeys.delete(interstitialPrepareKey(type));
    deps.log.error('Failed to prepare ad', { type, error });
    return false;
  }
}
