import {
  prepareInterstitial as prepareInterstitialInternal,
  type InterstitialType,
} from "./admob-interstitial";
import { interstitialDeps } from "./interstitial-deps";
export { showInterstitial } from "./show-interstitial";

export type { InterstitialType } from "./admob-interstitial";

export async function prepareInterstitial(
  type: InterstitialType = "interstitial",
): Promise<boolean> {
  return prepareInterstitialInternal(interstitialDeps(), type);
}
