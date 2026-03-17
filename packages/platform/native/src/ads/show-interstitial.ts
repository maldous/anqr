import { type InterstitialType } from "./admob-interstitial";
import { interstitialDeps } from "./interstitial-deps";
import { showInterstitial as showInterstitialInternal } from "./admob-interstitial";

export async function showInterstitial(type: InterstitialType = "interstitial"): Promise<boolean> {
  return showInterstitialInternal(interstitialDeps(), type);
}
