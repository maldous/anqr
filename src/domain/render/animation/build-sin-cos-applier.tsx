import { clampToByte } from './clamp-to-byte';
import { buildSinCosLUT } from './build-sin-cos-lut';
import type { PatternFrameApplier } from './pattern-frame-applier';

export function buildSinCosApplier(
  lut: ReturnType<typeof buildSinCosLUT>,
  width: number,
  height: number,
  baseScale: number,
  amplitudeScale: number
): PatternFrameApplier {
  return (data) => {
    for (let y = 0; y < height; y++) {
      const rs = lut.rowSin[y];
      const rc = lut.rowCos[y];
      let i = y * width * 4;
      for (let x = 0; x < width; x++, i += 4) {
        const v = lut.colSin[x] * rc + lut.colCos[x] * rs;
        const factor = baseScale + amplitudeScale * v;
        data[i] = clampToByte(data[i] * factor);
        data[i + 1] = clampToByte(data[i + 1] * factor);
        data[i + 2] = clampToByte(data[i + 2] * factor);
      }
    }
  };
}
