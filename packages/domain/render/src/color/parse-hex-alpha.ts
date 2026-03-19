import type { RGBA } from "@/domain/share";
import { parseHex } from "./parse-hex";

/** Parse hex color string with alpha to RGBA */
export function parseHexAlpha(hex: string): RGBA {
  hex = hex.replace("#", "");

  if (hex.length === 4) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }

  const rgb = parseHex(hex.substring(0, 6));
  const a = hex.length >= 8 ? Number.parseInt(hex.substring(6, 8), 16) / 255 : 1;

  return { ...rgb, a };
}
