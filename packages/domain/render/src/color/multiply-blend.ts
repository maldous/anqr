import type { RGB } from "@/contracts/generator";

export function multiplyBlend(top: RGB, bottom: RGB): RGB {
  return {
    r: Math.round((top.r * bottom.r) / 255),
    g: Math.round((top.g * bottom.g) / 255),
    b: Math.round((top.b * bottom.b) / 255),
  };
}
