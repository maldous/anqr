import type { InterstitialType } from "./interstitial.types";

export const interstitialPrepareKey = (type: InterstitialType): string => {
  return type === "rewardedInterstitial" ? "rewardedInterstitial" : `interstitial:${type}`;
};
