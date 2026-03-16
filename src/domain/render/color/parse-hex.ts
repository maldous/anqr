import type { RGB } from "../../../modules/core/types";

// ============================================
// COLOR PARSING
// ============================================

/** Parse hex color string to RGB */
export function parseHex(hex: string): RGB {
  hex = hex.replace("#", "");

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  return {
    r: Number.parseInt(hex.substring(0, 2), 16),
    g: Number.parseInt(hex.substring(2, 4), 16),
    b: Number.parseInt(hex.substring(4, 6), 16),
  };
}
