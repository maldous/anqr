import { sampleBlueNoise } from '../dither';
import { pixelIndex } from './pixel-index';
import { packColor } from './pack-color';
import { luma01 } from './luma01';
import { clamp01 } from './clamp01';
import { shapeOverlayDarkness } from './shape-overlay-darkness';
import { moduleCenterWeight } from './module-center-weight';
import { shouldLockModule } from './should-lock-module';
import { isFixedDarkModule } from './is-fixed-dark-module';
import { writeLockedModulePixel } from './write-locked-module-pixel';
import type { BlueNoisePixelCtx } from './blue-noise-pixel-ctx';

export function processBlueNoisePixel(
  ctx: BlueNoisePixelCtx,
  x: number,
  y: number,
  matrixBits: Uint8Array,
  packedColors: Uint32Array,
  desire: Float32Array
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

  if (moduleLocked) {
    writeLockedModulePixel(ctx, sampleIdx, qrIsDark, r, g, b, matrixBits, packedColors, desire);
    return;
  }

  const overlayDark = shapeOverlayDarkness(1 - luma01(r, g, b));
  // ART-FIRST: base decision solely on artwork luminance + global noise field.
  const centerW = moduleCenterWeight(x, y, ctx.scale);
  const polarityBoost = ctx.scanGateActive ? 1.18 : 1;
  const polarityBias =
    (qrIsDark ? 1 : -1) * (0.14 + ctx.intensity * 0.18) * (0.4 + centerW * 0.6) * polarityBoost;
  const qrBias = fixedDarkUnlocked
    ? 0
    : (qrIsDark ? 1 : -1) * ctx.effectiveBitBias * centerW * (0.45 + ctx.intensity * 0.8);
  const decisionGain = (0.64 + ctx.intensity * 0.44) * (ctx.scanGateActive ? 1.04 : 1);
  const d = clamp01((overlayDark + qrBias + polarityBias) * decisionGain);
  desire[sampleIdx] = clamp01(overlayDark + (qrIsDark ? 0.12 : -0.12));

  const n = sampleBlueNoise(x, y, ctx.tile, ctx.tileSize);
  const isDark = n < d;

  matrixBits[sampleIdx] = isDark ? 1 : 0;
  if (ctx.config.colorMode !== 'bw') {
    packedColors[sampleIdx] = packColor(r, g, b);
  }
}
