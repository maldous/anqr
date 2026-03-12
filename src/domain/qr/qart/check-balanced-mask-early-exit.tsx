import { BALANCED_MASK_EARLY_EXIT_THRESHOLD } from './balanced-mask-early-exit-threshold';
import { BALANCED_MASK_STALL_WINDOW } from './balanced-mask-stall-window';
import { BALANCED_MASK_STALL_DELTA } from './balanced-mask-stall-delta';
import { log } from './log';
import type { FullQArtResult } from './generate.types';

export function checkBalancedMaskEarlyExit(
  bestResult: FullQArtResult,
  lastBestMatch: number,
  masksWithoutMeaningfulGain: number,
  mask: number
): { shouldExit: boolean; masksWithoutMeaningfulGain: number } {
  if (bestResult.matchPercentage >= BALANCED_MASK_EARLY_EXIT_THRESHOLD) {
    log.info('Balanced profile: ending mask search early after reaching target match', {
      maskEvaluated: mask + 1,
      matchPercentage: `${bestResult.matchPercentage.toFixed(1)}%`,
      threshold: `${BALANCED_MASK_EARLY_EXIT_THRESHOLD}%`,
    });
    return { shouldExit: true, masksWithoutMeaningfulGain };
  }

  if (
    lastBestMatch >= 0 &&
    bestResult.matchPercentage - lastBestMatch < BALANCED_MASK_STALL_DELTA
  ) {
    masksWithoutMeaningfulGain += 1;
  } else {
    masksWithoutMeaningfulGain = 0;
  }

  if (masksWithoutMeaningfulGain >= BALANCED_MASK_STALL_WINDOW && mask >= 3) {
    log.info('Balanced profile: stopping mask search due to stalled improvement', {
      maskEvaluated: mask + 1,
      bestMatchPercentage: `${bestResult.matchPercentage.toFixed(1)}%`,
      stallWindow: BALANCED_MASK_STALL_WINDOW,
      minGain: BALANCED_MASK_STALL_DELTA,
    });
    return { shouldExit: true, masksWithoutMeaningfulGain };
  }

  return { shouldExit: false, masksWithoutMeaningfulGain };
}
