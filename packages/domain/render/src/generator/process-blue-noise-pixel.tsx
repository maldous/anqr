import { sampleBlueNoise } from "../dither";
import { packColor } from "./pack-color";
import { clamp01 } from "./clamp01";
import { moduleCenterWeight } from "./module-center-weight";
import { pixelSamplePrelude } from "./pixel-sample-prelude";
import { writeLockedModulePixel } from "./write-locked-module-pixel";
import type { BlueNoisePixelCtx } from "./blue-noise-pixel-ctx";

export function processBlueNoisePixel(
  ctx: BlueNoisePixelCtx,
  x: number,
  y: number,
  matrixBits: Uint8Array,
  packedColors: Uint32Array,
  desire: Float32Array,
): void {
  const { b, fixedDarkUnlocked, g, moduleLocked, overlayDark, qrIsDark, r, sampleIdx } =
    pixelSamplePrelude(ctx, x, y);

  if (moduleLocked) {
    writeLockedModulePixel(ctx, sampleIdx, qrIsDark, r, g, b, matrixBits, packedColors, desire);
    return;
  }
  // ART-FIRST: base decision solely on artwork luminance + global noise field.
  const centerW = moduleCenterWeight(x, y, ctx.scale);
  const polarityBoost = ctx.scanGateActive ? 1.18 : 1;
  const polarityBias =
    (qrIsDark ? 1 : -1) * (0.14 + ctx.intensity * 0.18) * (0.4 + centerW * 0.6) * polarityBoost;
  let qrBias: number;
  if (fixedDarkUnlocked) qrBias = 0;
  else qrBias = (qrIsDark ? 1 : -1) * ctx.effectiveBitBias * centerW * (0.45 + ctx.intensity * 0.8);
  const decisionGain = (0.64 + ctx.intensity * 0.44) * (ctx.scanGateActive ? 1.04 : 1);
  const d = clamp01((overlayDark + qrBias + polarityBias) * decisionGain);
  desire[sampleIdx] = clamp01(overlayDark + (qrIsDark ? 0.12 : -0.12));

  const n = sampleBlueNoise(x, y, ctx.tile, ctx.tileSize);
  const isDark = n < d;

  matrixBits[sampleIdx] = isDark ? 1 : 0;
  if (ctx.config.colorMode !== "bw") {
    packedColors[sampleIdx] = packColor(r, g, b);
  }
}
