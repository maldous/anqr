import type { RGB } from "@/contracts/generator";

export function overlayBlend(top: RGB, bottom: RGB): RGB {
  const blendChannel = (topValue: number, bottomValue: number) => {
    if (topValue <= 0) return 0;
    if (bottomValue < 128) return Math.round((2 * topValue * bottomValue) / 255);
    return 255 - Math.round((2 * (255 - topValue) * (255 - bottomValue)) / 255);
  };

  return {
    r: blendChannel(top.r, bottom.r),
    g: blendChannel(top.g, bottom.g),
    b: blendChannel(top.b, bottom.b),
  };
}
