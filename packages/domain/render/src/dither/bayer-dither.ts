import { BAYER_2, BAYER_4, BAYER_8 } from "./matrices";
import type { DitherResult } from "../dither-algorithms/types";
import { orderedDither } from "./ordered-dither";

/** Apply Bayer ordered dithering */
export function bayerDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  size: 2 | 4 | 8 = 4,
  levels: number = 2,
  strength: number = 100,
): DitherResult {
  const matrix = (() => {
    if (size === 2) return BAYER_2;
    if (size === 4) return BAYER_4;
    return BAYER_8;
  })();
  return orderedDither(imageData, width, height, matrix, levels, strength);
}
