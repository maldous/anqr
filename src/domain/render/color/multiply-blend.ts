import type { RGB } from '../../../modules/core/types';

/** Multiply blend mode */
export function multiplyBlend(c1: RGB, c2: RGB): RGB {
  return {
    r: Math.round((c1.r * c2.r) / 255),
    g: Math.round((c1.g * c2.g) / 255),
    b: Math.round((c1.b * c2.b) / 255),
  };
}
