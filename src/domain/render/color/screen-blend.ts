import type { RGB } from '../../../modules/core/types';

/** Screen blend mode */
export function screenBlend(c1: RGB, c2: RGB): RGB {
  return {
    r: Math.round(255 - ((255 - c1.r) * (255 - c2.r)) / 255),
    g: Math.round(255 - ((255 - c1.g) * (255 - c2.g)) / 255),
    b: Math.round(255 - ((255 - c1.b) * (255 - c2.b)) / 255),
  };
}
