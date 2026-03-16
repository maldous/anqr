import { clamp01 } from "./clamp01";
import { moduleCenterWeight } from "./module-center-weight";
import type { ErrorDiffusionPixelCtx } from "./error-diffusion-pixel-ctx";

export function computeBiasedDarkness(
  overlayDark: number,
  x: number,
  y: number,
  ctx: ErrorDiffusionPixelCtx,
  qrIsDark: boolean,
  fixedDarkUnlocked: boolean,
): number {
  const centerW = moduleCenterWeight(x, y, ctx.scale);
  const qrBias = fixedDarkUnlocked
    ? 0
    : (qrIsDark ? 1 : -1) * ctx.qrBitBiasStrength * centerW * (0.45 + ctx.mix * 0.8);
  return clamp01(overlayDark + qrBias);
}
