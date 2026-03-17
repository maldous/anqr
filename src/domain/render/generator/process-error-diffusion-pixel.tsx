import { packColor } from "./pack-color";
import { computeBiasedDarkness } from "./compute-biased-darkness";
import { pixelSamplePrelude } from "./pixel-sample-prelude";
import { resolveDarkCandidate } from "./resolve-dark-candidate";
import type { ErrorDiffusionPixelCtx } from "./error-diffusion-pixel-ctx";

export function processErrorDiffusionPixel(
  ctx: ErrorDiffusionPixelCtx,
  x: number,
  y: number,
  leftToRight: boolean,
  matrixBits: Uint8Array,
  packedColors: Uint32Array,
  desire: Float32Array,
  errors: Float32Array,
): void {
  const { b, fixedDarkUnlocked, g, moduleLocked, overlayDark, qrIsDark, r, sampleIdx } =
    pixelSamplePrelude(ctx, x, y);
  const biasedOverlayDark = computeBiasedDarkness(
    overlayDark,
    x,
    y,
    ctx,
    qrIsDark,
    fixedDarkUnlocked,
  );
  const threshold = ctx.sampleThreshold(x, y, sampleIdx, overlayDark);

  const isDarkCandidate = resolveDarkCandidate(
    ctx,
    biasedOverlayDark,
    threshold,
    sampleIdx,
    x,
    y,
    errors,
    leftToRight,
  );

  // Apply structural lock at the final write stage only.
  // This keeps diffusion state consistent so toggling locks doesn't re-shape the entire texture.
  if (moduleLocked) {
    matrixBits[sampleIdx] = qrIsDark ? 1 : 0;
    desire[sampleIdx] = qrIsDark ? 1 : 0;
  } else {
    matrixBits[sampleIdx] = isDarkCandidate ? 1 : 0;
    // Desire is artwork-driven and used later for minimal-cost correction ranking.
    desire[sampleIdx] = overlayDark;
  }
  if (ctx.config.colorMode !== "bw") {
    packedColors[sampleIdx] = packColor(r, g, b);
  }
}
