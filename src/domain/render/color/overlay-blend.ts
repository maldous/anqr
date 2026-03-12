import type { RGB } from '../../../modules/core/types';

function overlayChannel(top: number, bottom: number): number {
  if (top <= 0) return 0;
  if (bottom < 128) return Math.round((2 * top * bottom) / 255);
  return 255 - Math.round((2 * (255 - top) * (255 - bottom)) / 255);
}

export function overlayBlend(top: RGB, bottom: RGB): RGB {
  return {
    r: overlayChannel(top.r, bottom.r),
    g: overlayChannel(top.g, bottom.g),
    b: overlayChannel(top.b, bottom.b),
  };
}
