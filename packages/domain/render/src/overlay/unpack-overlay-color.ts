import type { RGBWithMeta } from "@/domain/render/qr-generator-shared";
import { COLOR_PRESENT_FLAG } from "./color-present-flag";

export function unpackOverlayColor(packed: number): RGBWithMeta | null {
  if ((packed & COLOR_PRESENT_FLAG) === 0) return null;
  return {
    r: (packed >> 16) & 0xff,
    g: (packed >> 8) & 0xff,
    b: packed & 0xff,
  };
}
