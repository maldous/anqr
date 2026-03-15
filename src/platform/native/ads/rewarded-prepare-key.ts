import type { RewardedType } from './rewarded-type';

export const rewardedPrepareKey = (type: RewardedType): string => {
  return type === 'rewardedInterstitial' ? 'rewardedInterstitial' : `rewarded:${type}`;
};
