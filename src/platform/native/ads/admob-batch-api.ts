import { type InterstitialType } from './admob-config';
import { trackGenerationAndShowAdInternal } from './admob-generation';
import { admobRuntime } from './admob-runtime-state';
import { prepareInterstitial, showInterstitial } from './admob-interstitial-api';
import { prepareRewardedAd } from './admob-rewarded-api';
export { trackGenerationAndShowAd } from './track-generation-and-show-ad';

export async function prepareAllAds(): Promise<void> {
  if (!admobRuntime.available) return;
  await Promise.all([
    prepareInterstitial('export'),
    prepareInterstitial('gallery'),
    prepareInterstitial('interstitial'),
    prepareInterstitial('rewardedInterstitial'),
    prepareRewardedAd('premium'),
    prepareRewardedAd('rewarded'),
  ]);
}
