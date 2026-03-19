import { getOverlayColor } from "../overlay/overlay-data-packed";
import type { OverlayData, RGBWithMeta } from "@/domain/render/qr-generator-shared";

/**
 * Normalize colors to RGB format
 * Supports packed overlay colors (with legacy sparse fallback via helper).
 */
export function normalizeColors(
  overlayData: OverlayData | null | undefined,
  moduleCount: number,
): (RGBWithMeta | null)[][] {
  const result: (RGBWithMeta | null)[][] = [];

  for (let row = 0; row < moduleCount; row++) {
    result[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      const color = getOverlayColor(overlayData, row, col);
      if (color) {
        // Color is already {r, g, b} object
        result[row][col] = {
          r: color.r,
          g: color.g,
          b: color.b,
        };
      } else {
        result[row][col] = null;
      }
    }
  }

  return result;
}
