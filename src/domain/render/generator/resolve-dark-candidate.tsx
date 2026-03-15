import { distributeError } from './distribute-error';
import type { ErrorDiffusionPixelCtx } from './error-diffusion-pixel-ctx';

export function resolveDarkCandidate(
  ctx: ErrorDiffusionPixelCtx,
  biasedOverlayDark: number,
  threshold: number,
  sampleIdx: number,
  x: number,
  y: number,
  errors: Float32Array,
  leftToRight: boolean
): boolean {
  if (ctx.thresholdOnly && !ctx.useColorDither) {
    return biasedOverlayDark > threshold;
  }
  const adjusted = biasedOverlayDark + errors[sampleIdx];
  const isDark = adjusted > threshold;
  const err = (biasedOverlayDark - (isDark ? 1 : 0)) * ctx.mix;
  distributeError(errors, x, y, err, ctx.kernel, ctx.scaledSize, leftToRight);
  return isDark;
}
