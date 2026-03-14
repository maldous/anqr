import type { InterstitialType } from './admob-config';
import { generationCountState } from './generation-count-state';

export { getGenerationCount } from './get-generation-count';
export { resetGenerationCount } from './reset-generation-count';

export async function trackGenerationAndShowAdInternal(
  showInterstitial: (type: InterstitialType) => Promise<boolean>,
  prepareInterstitial: (type: InterstitialType) => Promise<boolean>,
  interval: number = 5,
  type: InterstitialType = 'interstitial'
): Promise<boolean> {
  generationCountState.value += 1;
  if (generationCountState.value % interval !== 0) return false;
  const shown = await showInterstitial(type);
  if (shown) prepareInterstitial(type);
  return shown;
}
