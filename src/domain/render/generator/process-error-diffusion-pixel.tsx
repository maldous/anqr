import { pixelIndex } from './pixel-index';
import { packColor } from './pack-color';
import { luma01 } from './luma01';
import { shapeOverlayDarkness } from './shape-overlay-darkness';
import { shouldLockModule } from './should-lock-module';
import { isFixedDarkModule } from './is-fixed-dark-module';
import { computeBiasedDarkness } from './compute-biased-darkness';
import { resolveDarkCandidate } from './resolve-dark-candidate';
import type { ErrorDiffusionPixelCtx } from './error-diffusion-pixel-ctx';

export function processErrorDiffusionPixel(
  ctx: ErrorDiffusionPixelCtx,
  x: number,
  y: number,
  leftToRight: boolean,
  matrixBits: Uint8Array,
  packedColors: Uint32Array,
  desire: Float32Array,
  errors: Float32Array
): void {
  const sampleIdx = pixelIndex(x, y, ctx.scaledSize);
  const idx = sampleIdx * 4;
  const r = ctx.data[idx];
  const g = ctx.data[idx + 1];
  const b = ctx.data[idx + 2];

  const moduleRow = Math.floor(y / ctx.scale);
  const moduleCol = Math.floor(x / ctx.scale);
  const qrIsDark = ctx.qr.isDark(moduleRow, moduleCol);
  const moduleLocked = shouldLockModule(
    moduleRow,
    moduleCol,
    ctx.moduleCount,
    ctx.version,
    ctx.config
  );
  const fixedDarkUnlocked =
    !moduleLocked && isFixedDarkModule(moduleRow, moduleCol, ctx.moduleCount);

  const overlayDark = shapeOverlayDarkness(1 - luma01(r, g, b));
  const biasedOverlayDark = computeBiasedDarkness(
    overlayDark,
    x,
    y,
    ctx,
    qrIsDark,
    fixedDarkUnlocked
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
    leftToRight
  );

  // Apply structural lock at the final write stage only.
  // This keeps diffusion state consistent so toggling locks doesn't re-shape the entire texture.
  matrixBits[sampleIdx] = moduleLocked ? (qrIsDark ? 1 : 0) : isDarkCandidate ? 1 : 0;
  // Desire is artwork-driven and used later for minimal-cost correction ranking.
  desire[sampleIdx] = moduleLocked ? (qrIsDark ? 1 : 0) : overlayDark;
  if (ctx.config.colorMode !== 'bw') {
    packedColors[sampleIdx] = packColor(r, g, b);
  }
}
