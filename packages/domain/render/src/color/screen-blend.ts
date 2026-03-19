import type { RGB } from "@/contracts/generator";

export function screenBlend(top: RGB, bottom: RGB): RGB {
  return {
    r: 255 - Math.round(((255 - top.r) * (255 - bottom.r)) / 255),
    g: 255 - Math.round(((255 - top.g) * (255 - bottom.g)) / 255),
    b: 255 - Math.round(((255 - top.b) * (255 - bottom.b)) / 255),
  };
}
