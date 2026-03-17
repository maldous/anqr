import type { RGBA } from "@/modules/core/types";
import { parseHexAlpha } from "./parse-hex-alpha";
import { parseRgbString } from "./parse-rgb-string";
import { parseHslString } from "./parse-hsl-string";
import { hslToRgb } from "./hsl-to-rgb";
import { NAMED_COLORS } from "./named-colors";

/** Parse any color string to RGBA, or null if unrecognizable */
export function parseColor(color: string): RGBA | null {
  color = color.trim().toLowerCase();

  if (color.startsWith("#")) {
    return parseHexAlpha(color);
  }

  if (color.startsWith("rgb")) {
    return parseRgbString(color);
  }

  if (color.startsWith("hsl")) {
    const hsl = parseHslString(color);
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return { ...rgb, a: hsl.a };
  }

  if (NAMED_COLORS[color]) {
    return parseHexAlpha(NAMED_COLORS[color]);
  }

  return null;
}
