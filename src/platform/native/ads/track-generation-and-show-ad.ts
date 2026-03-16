import { type InterstitialType } from "./admob-config";
import { trackGenerationAndShowAdInternal } from "./admob-generation";
import { prepareInterstitial, showInterstitial } from "./admob-interstitial-api";

export async function trackGenerationAndShowAd(
  interval: number = 5,
  type: InterstitialType = "interstitial",
): Promise<boolean> {
  return trackGenerationAndShowAdInternal(showInterstitial, prepareInterstitial, interval, type);
}
