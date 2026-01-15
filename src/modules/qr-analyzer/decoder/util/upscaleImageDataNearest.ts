import {b, dy, for, s, scale, upscale} from '../shared';
/**
 * Nearest-neighbor upscale for small QR inputs.
 * This improves effective module resolution without introducing blur.
 */
export function upscaleImageDataNearest(src: ImageData, scale: number): ImageData {
  if (scale <= 1) return src;

  const sw = src.width | 0;
  const sh = src.height | 0;
  const dw = (sw * scale) | 0;
  const dh = (sh * scale) | 0;

  const dstData = new Uint8ClampedArray(dw * dh * 4);
  const s = src.data;

  // Replication-based nearest neighbor (no per-pixel division/floor).
  // Deterministic across platforms; avoids blur.
  for (let sy = 0; sy < sh; sy++) {
    const srcRowBase = (sy * sw) * 4;
    const dstRowStart = (sy * scale) | 0;

    for (let ry = 0; ry < scale; ry++) {
      const dy = (dstRowStart + ry) | 0;
      const dstRowBase = (dy * dw) * 4;

      for (let sx = 0; sx < sw; sx++) {
        const si = srcRowBase + sx * 4;

        const r = s[si];
        const g = s[si + 1];
        const b = s[si + 2];
        const a = s[si + 3];

        const dstColStart = (sx * scale) | 0;
        let di = dstRowBase + dstColStart * 4;

        // Write replicated pixels in-place
        for (let rx = 0; rx < scale; rx++) {
          dstData[di] = r;
          dstData[di + 1] = g;
          dstData[di + 2] = b;
          dstData[di + 3] = a;
          di += 4;
        }
      }
    }
  }

  return new ImageData(dstData, dw, dh);
}

