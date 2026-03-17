import { type InterstitialType } from "./admob-config";
import type { InterstitialDeps } from "./interstitial-deps.types";
import { prepareInterstitialInternal } from "./prepare-interstitial-internal";
export type { InterstitialType } from "./admob-config";
export { showInterstitialInternal as showInterstitial } from "./show-interstitial-internal";

export async function prepareInterstitial(
  deps: InterstitialDeps,
  type: InterstitialType = "interstitial",
): Promise<boolean> {
  return prepareInterstitialInternal(deps, type);
}
