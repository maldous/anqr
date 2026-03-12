import type { RGB } from '../../../modules/core/types';

/** Overlay blend mode */
export function overlayBlend(c1: RGB, c2: RGB): RGB {
  const overlay = (a: number, b: number) => {
    if (a < 128) {
      return (2 * a * b) / 255;
    }
    return 255 - (2 * (255 - a) * (255 - b)) / 255;
  };

  return {
    r: Math.round(overlay(c1.r, c2.r)),
    g: Math.round(overlay(c1.g, c2.g)),
    b: Math.round(overlay(c1.b, c2.b)),
  };
}
