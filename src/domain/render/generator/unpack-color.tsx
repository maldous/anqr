import type { RGBWithMeta } from "./types";
import { COLOR_PACKED_FLAG } from "./color-packed-flag";

export function unpackColor(value: number): RGBWithMeta | null {
  if ((value & COLOR_PACKED_FLAG) === 0) return null;
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}
