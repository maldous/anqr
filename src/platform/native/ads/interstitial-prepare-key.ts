import type { InterstitialType } from './interstitial-type';

export const interstitialPrepareKey = (type: InterstitialType): string => {
  return type === 'rewardedInterstitial' ? 'rewardedInterstitial' : `interstitial:${type}`;
};
