import { packColor } from "./pack-color";
import type { BlueNoisePixelCtx } from "./blue-noise-pixel-ctx";

export function writeLockedModulePixel(
  ctx: BlueNoisePixelCtx,
  sampleIdx: number,
  qrIsDark: boolean,
  r: number,
  g: number,
  b: number,
  matrixBits: Uint8Array,
  packedColors: Uint32Array,
  desire: Float32Array,
): void {
  matrixBits[sampleIdx] = qrIsDark ? 1 : 0;
  if (ctx.config.colorMode !== "bw") {
    packedColors[sampleIdx] = packColor(r, g, b);
  }
  desire[sampleIdx] = qrIsDark ? 1 : 0;
}
