import type { RewardedType } from "./rewarded.types";

export const rewardedPrepareKey = (type: RewardedType): string => {
  return type === "rewardedInterstitial" ? "rewardedInterstitial" : `rewarded:${type}`;
};
